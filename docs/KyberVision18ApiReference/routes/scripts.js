const express = require("express");
const router = express.Router();
const { Action, Script, ContractUserAction } = require("kybervision18db");

const { authenticateToken } = require("../modules/userAuthentication");

// POST /scripts/scripting-live-screen/receive-actions-array
router.post(
	"/scripting-live-screen/receive-actions-array",
	authenticateToken,
	async (req, res) => {
		console.log(
			"- accessed POST /scripts/scripting-live-screen/receive-actions-array"
		);
		const user = req.user;
		let { actionsArray, sessionId } = req.body;

		// search actionsArray for earliest timestamp
		const earliestTimestamp = actionsArray.reduce((min, action) => {
			return action.timestamp < min ? action.timestamp : min;
		}, actionsArray[0].timestamp);

		try {
			// if (!scriptId) {
			// Create a new script
			const script = await Script.create({
				sessionId,
				timestampReferenceFirstAction: earliestTimestamp,
				isScriptingLive: true,
			});
			let scriptId = script.id;
			// }

			// Sort by timestamp ascending
			actionsArray = actionsArray.sort((a, b) => a.timestamp - b.timestamp);

			for (const elem of actionsArray) {
				await Action.sequelize.transaction(async (t) => {
					const actionObj = { ...elem, scriptId };

					const action = await Action.create(actionObj, { transaction: t });

					if (elem.favorite === true) {
						await ContractUserAction.create(
							{ actionId: action.id, userId: user.id, sessionId },
							{ transaction: t }
						);
					}
				});
			}
			res.json({
				result: true,
				message: `Actions for scriptId: ${scriptId}`,
				scriptId,
			});
		} catch (error) {
			console.error("Error in /receive-actions-array:", error);
			res.status(500).json({ result: false, error: "Internal Server Error" });
		}
	}
);

module.exports = router;
