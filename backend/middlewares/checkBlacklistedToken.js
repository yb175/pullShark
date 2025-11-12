import redisClient from "../config/redisClient.js";
import jwt from "jsonwebtoken";

export default async function checkBlacklistedToken(req, res, next) {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.accesstoken;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "No access token provided" });
    }
    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: "Access token is blacklisted. Please login again." });
    }
    // Optionally, verify token here or in another middleware
    req.accesstoken = token;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Token check failed" });
  }
}
