import jwt from "jsonwebtoken";
import UserModel from "../../models/user/userSchema.js";

export default async function refreshTokenController(req, res) {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
    const user = await UserModel.findOne({ userId: decoded.id, refreshToken });
    if (!user) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }
    // Issueing new access token
    const newAccessToken = jwt.sign(
      {
        id: user.userId,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );
    res.cookie("accesstoken", newAccessToken, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
  }
}