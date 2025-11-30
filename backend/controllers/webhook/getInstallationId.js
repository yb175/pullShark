import UserModel from "../../models/user/userSchema.js";
import axios from "axios";
export default async function getInstallationId(req, res) {
  try {
    const installationId = req.query.installation_id;

    if (!installationId) {
      return res
        .status(400)
        .json({ success: false, message: "No installation_id" });
    }

    // Identify user
    const user = req.user; // if already logged in
    if(!user) return res.status(401).json({ success: false, message: "User not authenticated" });
    // Save in DB
    await UserModel.updateOne(
      { userId: user.userId },
      { installationId: installationId, installationActive: true }
    );

    return res.json({
      success: true,
      message: "GitHub App installed successfully!",
      installationId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
