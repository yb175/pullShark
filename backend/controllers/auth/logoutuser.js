import UserModel from "../../models/user/userSchema.js";
import jwt from "jsonwebtoken";
import redisClient from "../../config/redisClient.js";

export default async function logoutUser(req, res) {
  try {
    // Get access token from cookie
    const accessToken = req.cookies.accesstoken;
    if (accessToken) {
      // Decode token to get expiry
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - now;
        if (ttl > 0) {
          // Blacklist the token in Redis with expiry
          await redisClient.set(`bl_${accessToken}`, 1, { EX: ttl });
        }
      }
    }

    const userId = req?.accesstoken?.id;
    console.log(userId);
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
