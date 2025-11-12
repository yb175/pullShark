import UserModel from "../../models/user/userSchema.js";

export default async function logoutUser(req, res) {
  try {

    const userId = req.user?.id || req.body.userId ;
    if (userId) {
      await UserModel.updateOne({ userId }, { $unset: { refreshToken: "" } });
    }
    
    res.clearCookie("accesstoken");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
}
