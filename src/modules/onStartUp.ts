import fs from "fs";
import bcrypt from "bcrypt";
import { User, League } from "kybervision20db";

export function verifyCheckDirectoryExists(): void {
  // Add directory paths to check (and create if they don't exist)
  const pathsToCheck = [
    process.env.PATH_DATABASE,
    process.env.PATH_PROJECT_RESOURCES,
    process.env.PATH_VIDEOS,
    process.env.PATH_VIDEOS_UPLOADED,
    process.env.PATH_DB_BACKUPS,
    process.env.PATH_PROFILE_PICTURES_PLAYER_DIR,
  ].filter((path): path is string => typeof path === "string");

  pathsToCheck.forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  });
}

export async function onStartUpCreateLeague(): Promise<void> {
  const existingLeague = await League.findOne({
    where: { name: "General League" },
  });
  if (existingLeague) {
    console.log("ℹ️  General league already initialized. Skipping setup.");
    return;
  }
  await League.create({
    name: "General League",
    category: "General",
  });
}

export async function onStartUpCreateEnvUsers(): Promise<void> {
  if (!process.env.ADMIN_EMAIL_KV_MANAGER_WEBSITE) {
    console.warn("⚠️ No admin emails found in env variables.");
    return;
  }

  let adminEmails: string[];
  try {
    adminEmails = JSON.parse(process.env.ADMIN_EMAIL_KV_MANAGER_WEBSITE);
    if (!Array.isArray(adminEmails)) throw new Error();
  } catch (error) {
    console.error(
      "❌ Error parsing ADMIN_EMAIL_KV_MANAGER_WEBSITE. Ensure it's a valid JSON array."
    );
    return;
  }

  for (const email of adminEmails) {
    try {
      const existingUser = await User.findOne({ where: { email } });

      if (!existingUser) {
        console.log(`🔹 Creating admin user: ${email}`);

        const hashedPassword = await bcrypt.hash("test", 10); // Default password, should be changed later.

        await User.create({
          username: email.split("@")[0],
          email,
          password: hashedPassword,
          isAdminForKvManagerWebsite: true, // Set admin flag
        });

        console.log(`✅ Admin user created: ${email}`);
      } else {
        console.log(`ℹ️  User already exists: ${email}`);
      }
    } catch (err) {
      console.error(`❌ Error creating admin user (${email}):`, err);
    }
  }
}