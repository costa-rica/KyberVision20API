import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import os from "os";
import {
	sendRegistrationEmail,
	sendResetPasswordEmail,
} from "../modules/mailer";
import { authenticateToken } from "../modules/userAuthentication";

// Import from the KyberVision20Db package
import { User, ContractTeamUser, PendingInvitations } from "kybervision20db";

const router = express.Router();

// POST /users/register
router.post("/register", async (req: Request, res: Response) => {
	const { firstName, lastName, password, email } = req.body;

	if (!password || !email) {
		return res.status(400).json({ error: "All fields are required." });
	}

	const username = email.split("@")[0];

	const existingUser = await User.findOne({ where: { email } });
	if (existingUser) {
		return res.status(400).json({ error: "User already exists." });
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await User.create({
		firstName,
		lastName,
		password: hashedPassword,
		email,
		username,
	});

	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

	const areWeOnMacMiniWorkstation = os.hostname();
	console.log(`areWeOnMacMiniWorkstation: ${areWeOnMacMiniWorkstation}`);
	if (
		areWeOnMacMiniWorkstation !== "Nicks-Mac-mini.local" &&
		areWeOnMacMiniWorkstation !== "Nicks-MacBook-Air.local"
	) {
		await sendRegistrationEmail(email, username)
			.then(() => console.log("Email sent successfully"))
			.catch((error) => console.error("Email failed:", error));
	} else {
		console.log("Email not sent");
	}

	// Check if pending invitation exists
	const pendingInvitationArray = await PendingInvitations.findAll({
		where: { email },
	});
	if (pendingInvitationArray.length > 0) {
		// Create contract team user for each teamId in pendingInvitationArray
		await Promise.all(
			pendingInvitationArray.map(async (pendingInvitation) => {
				await ContractTeamUser.create({
					teamId: pendingInvitation.teamId,
					userId: user.id,
				});
				// Delete pending invitation
				await pendingInvitation.destroy();
			})
		);
	}

	res.status(201).json({ message: "Successfully created user", user, token });
});

// POST /users/login
router.post("/login", async (req: Request, res: Response) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required." });
	}

	const user = await User.findOne({
		where: { email },
		include: [ContractTeamUser],
	});
	if (!user) {
		return res.status(404).json({ error: "User not found." });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return res.status(401).json({ error: "Invalid password." });
	}

	// updatedAt is automatically managed by Sequelize
	await user.save();

	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

	const { password: _, ...userWithoutPassword } = user.toJSON();

	res.status(200).json({
		message: "Successfully logged in",
		token,
		user: userWithoutPassword,
	});
});

// POST /users/request-reset-password-email
router.post(
	"/request-reset-password-email",
	async (req: Request, res: Response) => {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ error: "Email is required." });
		}

		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "1h",
		});

		await sendResetPasswordEmail(email, token)
			.then(() => console.log("Email sent successfully"))
			.catch((error) => console.error("Email failed:", error));

		res.status(200).json({ message: "Email sent successfully" });
	}
);

// POST /users/reset-password-with-new-password
router.post(
	"/reset-password-with-new-password",
	authenticateToken,
	async (req: Request, res: Response) => {
		const { password } = req.body;

		if (!password) {
			return res.status(400).json({ error: "Password is required." });
		}

		const user = await User.findOne({ where: { id: req.user?.id } });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await user.update({ password: hashedPassword });

		res.status(200).json({ message: "Password reset successfully" });
	}
);

export default router;
