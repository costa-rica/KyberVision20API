import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { Parser } from "json2csv";
import { promisify } from "util";

import {
  sequelize,
  User,
  Video,
  Action,
  ContractLeagueTeam,
  Complex,
  ContractTeamUser,
  League,
  Session,
  OpponentServeTimestamp,
  Player,
  ContractTeamPlayer,
  Script,
  ContractVideoAction,
  Team,
  ContractPlayerUser,
  ContractUserAction,
  PendingInvitations,
} from "kybervision20db";

const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

const models: Record<string, any> = {
  User,
  Video,
  Action,
  ContractLeagueTeam,
  Complex,
  ContractTeamUser,
  League,
  Session,
  OpponentServeTimestamp,
  Player,
  ContractTeamPlayer,
  Script,
  ContractVideoAction,
  Team,
  ContractPlayerUser,
  ContractUserAction,
  PendingInvitations,
};

interface BackupResult {
  success: boolean;
  message?: string;
  error?: string;
  failedOnTableName?: string;
}

export async function readAndAppendDbTables(backupFolderPath: string): Promise<BackupResult> {
  console.log(`Processing CSV files from: ${backupFolderPath}`);
  console.log(`Sequelize instance: ${sequelize}`);
  let currentTable: string | null = null;
  try {
    // Read all CSV files from the backup directory
    const csvFiles = await fs.promises.readdir(backupFolderPath);
    let totalRecordsImported = 0;

    // Separate CSV files into four append batches
    const appendBatch1: string[] = [];

    csvFiles.forEach((file) => {
      if (!file.endsWith(".csv")) return; // Skip non-CSV files
      appendBatch1.push(file);
    });

    console.log(`Append Batch 1 (First): ${appendBatch1}`);

    // Helper function to process CSV files
    const processCSVFiles = async (files: string[]): Promise<number> => {
      let recordsImported = 0;

      for (const file of files) {
        const tableName = file.replace(".csv", "");
        if (!models[tableName]) {
          console.log(`Skipping ${file}, no matching table found.`);
          continue;
        }

        console.log(`Importing data into table: ${tableName}`);
        currentTable = tableName;
        const filePath = path.join(backupFolderPath, file);
        const records: any[] = [];

        // Read CSV file
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => records.push(row))
            .on("end", resolve)
            .on("error", reject);
        });

        if (records.length > 0) {
          await models[tableName].bulkCreate(records, {
            ignoreDuplicates: true,
          });
          recordsImported += records.length;
          console.log(`Imported ${records.length} records into ${tableName}`);
        } else {
          console.log(`No records found in ${file}`);
        }
      }

      return recordsImported;
    };

    // 🔹 Disable foreign key constraints before importing
    // ↪This allows us to append when necessary foreign keys are not yet populated.
    console.log("Disabling foreign key constraints...");
    await sequelize.query("PRAGMA foreign_keys = OFF;");

    // Process the batches in order
    totalRecordsImported += await processCSVFiles(appendBatch1); // First batch

    // 🔹 Re-enable foreign key constraints after importing
    console.log("Re-enabling foreign key constraints...");
    await sequelize.query("PRAGMA foreign_keys = ON;");

    return {
      success: true,
      message: `Successfully imported ${totalRecordsImported} records.`,
    };
  } catch (error: any) {
    console.error("Error processing CSV files:", error);

    // Ensure foreign key constraints are re-enabled even if an error occurs
    await sequelize.query("PRAGMA foreign_keys = ON;");

    return {
      success: false,
      error: error.message,
      failedOnTableName: currentTable || undefined,
    };
  }
}

export async function createDatabaseBackupZipFile(suffix: string = ""): Promise<string> {
  console.log(`suffix: ${suffix}`);
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 15);

    const backupDir = path.join(
      process.env.PATH_DB_BACKUPS!,
      `db_backup_${timestamp}${suffix}`
    );
    console.log(`Backup directory: ${backupDir}`);
    await mkdirAsync(backupDir, { recursive: true });

    let hasData = false;

    for (const tableName in models) {
      // console.log(`Processing table: ${tableName}`);
      if (models.hasOwnProperty(tableName)) {
        const records = await models[tableName].findAll({ raw: true });
        if (records.length === 0) continue;

        const json2csvParser = new Parser();
        const csvData = json2csvParser.parse(records);

        const filePath = path.join(backupDir, `${tableName}.csv`);
        await writeFileAsync(filePath, csvData);
        hasData = true;
      }
    }

    if (!hasData) {
      await fs.promises.rmdir(backupDir, { recursive: true });
      throw new Error("No data found in any tables. Backup skipped.");
    }

    const zipFileName = `db_backup_${timestamp}${suffix}.zip`;
    const zipFilePath = path.join(process.env.PATH_DB_BACKUPS!, zipFileName);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    return new Promise<string>((resolve, reject) => {
      output.on("close", () => resolve(zipFilePath));
      archive.on("error", reject);
      archive.pipe(output);
      archive.directory(backupDir, false);
      archive.finalize().then(() => {
        fs.promises.rmdir(backupDir, { recursive: true });
      });
    });
  } catch (error: any) {
    console.error("Error creating database backup:", error);
    throw error;
  }
}

export { models };