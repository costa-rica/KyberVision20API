
// app.ts — KyberVision20API
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

// ⬇️ Import your DB package (use the exact package.json "name" from KyberVision20Db)
import { initModels, sequelize } from "kybervision20db";

// Import onStartUp functions
import { 
  verifyCheckDirectoryExists,
  onStartUpCreateEnvUsers,
  onStartUpCreateLeague 
} from "./modules/onStartUp";

// Routers (keep whatever you already have)
import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import adminDbRouter from "./routes/adminDb";
import teamsRouter from "./routes/teams";
import sessionsRouter from "./routes/sessions";
import contractTeamUsersRouter from "./routes/contractTeamUsers";
import playersRouter from "./routes/players";
import contractPlayerUsersRouter from "./routes/contractPlayerUsers";
import contractUserActionsRouter from "./routes/contractUserActions";
import contractVideoActionsRouter from "./routes/contractVideoActions";
import leaguesRouter from "./routes/leagues";


// Verify and create necessary directories first
verifyCheckDirectoryExists();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    credentials: true,
    exposedHeaders: ["Content-Disposition"], // <-- this line is key
  })
);

// Middleware configuration
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin-db", adminDbRouter);
app.use("/teams", teamsRouter);
app.use("/sessions", sessionsRouter);
app.use("/contract-team-users", contractTeamUsersRouter);
app.use("/players", playersRouter);
app.use("/contract-player-users", contractPlayerUsersRouter);
app.use("/contract-user-actions", contractUserActionsRouter);
app.use("/contract-video-actions", contractVideoActionsRouter);
app.use("/leagues", leaguesRouter);

// Increase payload size for large files
app.use(express.json({ limit: "6gb" }));
app.use(express.urlencoded({ limit: "6gb", extended: true }));

async function bootstrap() {
  try {
    // Initialize and sync DB
    initModels();
    await sequelize.sync(); // or { alter: true } while iterating
    console.log("✅ Database connected & synced");

    // Run startup functions after database is ready
    await onStartUpCreateEnvUsers();
    await onStartUpCreateLeague();

    // Start HTTP server only after DB is ready
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

bootstrap();