import express from "express";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  console.log("index endpoint called 🚀");
  res.send("index endpoint");
});

export default router;