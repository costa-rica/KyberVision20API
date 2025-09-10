import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import os from "os";
import { sendRegistrationEmail } from "../modules/mailer";

// Import from the KyberVision20Db package
import { User, ContractTeamUser, PendingInvitations } from "kybervision20db";

const router = express.Router();

// POST /users/register
router.post("/register", async (req: Request, res: Response) => {
  const { firstName, lastName, password, email } = req.body;

  if (!password || !email) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const username = email.split("@")[0];

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "L'utilisateur existe déjà." });
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
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  const user = await User.findOne({
    where: { email },
    include: [ContractTeamUser],
  });
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }

  // updatedAt is automatically managed by Sequelize
  await user.save();

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

  const { password: _, ...userWithoutPassword } = user.toJSON();

  res
    .status(200)
    .json({ message: "Connexion réussie.", token, user: userWithoutPassword });
});

export default router;