import jwt from "jsonwebtoken";
import axios from "axios";
import UserModel from "../models/user/userSchema.js";

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export default async function refreshGitHubTokenMiddleware(req, res, next) {
  const accessToken = req.cookies.accesstoken;

  if (!accessToken) {
    return res
      .status(401)
      .json({ success: false, message: "No access token provided" });
  }

  let decodedAppToken;
  try {
    // 1. Verify the application's JWT
    decodedAppToken = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
  } catch (err) {
    // This catches errors if the *app's* JWT is expired or invalid
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "App session expired. Please log in again." });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid app token." });
  }

  try {
    // 2. Fetch the user from the database
    const user = await UserModel.findOne({ userId: decodedAppToken.id });
    if (!user) {
      return res.status(403).json({ success: false, message: "User not found" });
    }

    // 3. Check the GitHub access token's expiry (from the DB)
    const ttl_ms = new Date(user.accessTokenExpiresAt).getTime() - Date.now();

    // 4. Check if the token needs refreshing
    if (ttl_ms <= REFRESH_THRESHOLD_MS) {
      // GitHub token is expiring soon or has expired, time to refresh
      
      // Check if GitHub refresh token itself is expired
      if (
        user.refreshTokenExpiresAt &&
        new Date() > user.refreshTokenExpiresAt
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "GitHub refresh token expired. Please log in again.",
          });
      }

      // Request new GitHub access token
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: user.refreshToken,
        },
        { headers: { Accept: "application/json" } }
      );

      const {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: newExpiresIn,
        refresh_token_expires_in: newRefreshTokenExpiresIn,
      } = tokenResponse.data;

      if (!newAccessToken) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to refresh GitHub token" });
      }

      // Update user document with new token info
      user.accessToken = newAccessToken;
      user.accessTokenExpiresAt = new Date(Date.now() + newExpiresIn * 1000);
      if (newRefreshToken) {
        user.refreshToken = newRefreshToken;
      }
      if (newRefreshTokenExpiresIn) {
        user.refreshTokenExpiresAt = new Date(
          Date.now() + newRefreshTokenExpiresIn * 1000
        );
      }
      
      await user.save();
      
      // We must also re-issue our *app's* JWT because it contains
      // the (now stale) GitHub token expiry.
      const newAppAccessToken = jwt.sign(
        {
          id: user.userId,
          username: user.username,
          email: user.email,
          ghTokenExpiresAt: user.accessTokenExpiresAt, // Store the new expiry
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "4d" } // Or your app's standard expiry
      );

      // Set the new cookie
      res.cookie("accesstoken", newAppAccessToken, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000,
      });

      // Attach the updated user to the request for the next handler
      req.user = user;
      
    } else {
      // Token is fine, just attach user to request
      req.user = user;
    }

    // 5. All good, proceed to the actual route handler
    next();

  } catch (err) {
    // Catches errors from DB query or GitHub API call
    console.error("GitHub Token Refresh Middleware Error:", err.message);
    // Check if it's a GitHub API error (e.g., bad refresh token)
    if (err.response && err.response.data) {
       return res.status(403).json({ success: false, message: "GitHub API error.", error: err.response.data });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error during token refresh." });
  }
}