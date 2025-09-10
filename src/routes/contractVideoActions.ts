import express, { Request, Response } from "express";
import {
  ContractVideoAction,
  Action,
} from "kybervision20db";
import { authenticateToken } from "../modules/userAuthentication";

const router = express.Router();

// POST /contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script
router.post(
  "/scripting-sync-video-screen/update-delta-time-all-actions-in-script",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log(
      `- in POST /scripting-sync-video-screen/update-delta-time-all-actions-in-script`
    );

    try {
      const { newDeltaTimeInSeconds, scriptId, videoId } = req.body;
      console.log(`newDeltaTimeInSeconds: ${newDeltaTimeInSeconds}`);

      // Convert parameters to ensure proper types
      const scriptIdNumber = Number(scriptId);
      const videoIdNumber = Number(videoId);
      const deltaTimeNumber = Number(newDeltaTimeInSeconds);

      const actionsArray = await Action.findAll({
        where: { scriptId: scriptIdNumber },
        order: [["timestamp", "ASC"]],
        include: [ContractVideoAction],
      });

      if (!actionsArray || actionsArray.length === 0) {
        return res.status(404).json({
          result: false,
          message: `Actions not found`,
          scriptId: scriptIdNumber,
        });
      }

      // Get array of ContractVideoActions where actionId is in actionsArray
      const contractVideoActionsArray = await ContractVideoAction.findAll({
        where: {
          actionId: actionsArray.map((action) => action.id),
          videoId: videoIdNumber,
        },
      });

      if (contractVideoActionsArray.length === 0) {
        return res.status(404).json({
          result: false,
          message: `ContractVideoActions not found for video ${videoIdNumber}`,
          scriptId: scriptIdNumber,
          videoId: videoIdNumber,
        });
      }

      // Modify contractVideoActionsArray.deltaTimeInSeconds
      for (let i = 0; i < contractVideoActionsArray.length; i++) {
        contractVideoActionsArray[i].deltaTimeInSeconds = deltaTimeNumber;
        await contractVideoActionsArray[i].save();
      }

      res.json({
        result: true,
        message: `ContractVideoAction modified with success`,
        scriptId: scriptIdNumber,
        updatedCount: contractVideoActionsArray.length,
      });
    } catch (error: any) {
      console.error("❌ Error updating contract video actions:", error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

export default router;