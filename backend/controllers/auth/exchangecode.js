import jwt from "jsonwebtoken";
import axios from "axios";
import UserModel from "../../models/user/userSchema.js";

export default async function exchangeToken(req, res) {
  const code = req.params.code;
  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Missing code",
    });
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const {
      access_token,
      refresh_token,
      refresh_token_expires_in,
      expires_in,
    } = tokenResponse.data;

    const ghAccessTokenExpiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 2 * 60 * 60 * 1000);

    const ghRefreshTokenExpiresAt = refresh_token_expires_in
      ? new Date(Date.now() + refresh_token_expires_in * 1000)
      : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "Failed to obtain GitHub access token",
      });
    }

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${access_token}` },
    });

    const ghUser = userResponse.data;

    let user = await UserModel.findOne({ userId: ghUser.id });
    if (!user) {
      user = new UserModel({
        userId: ghUser.id,
        email: ghUser.email || `${ghUser.login}@users.noreply.github.com`,
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        accessToken: access_token,
        accessTokenExpiresAt: ghAccessTokenExpiresAt,
        refreshToken: refresh_token,
        refreshTokenExpiresAt: ghRefreshTokenExpiresAt,
      });
    } else {
      user.accessToken = access_token;
      user.accessTokenExpiresAt = ghAccessTokenExpiresAt;
      user.refreshToken = refresh_token;
      user.refreshTokenExpiresAt = ghRefreshTokenExpiresAt;
      user.avatarUrl = ghUser.avatar_url;
    }

    const accessToken = jwt.sign(
      {
        id: user.userId,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        ghTokenExpiresAt: ghAccessTokenExpiresAt,
        ghAccessToken: access_token,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "4d" }
    );

    await user.save();

    res.cookie("accesstoken", accessToken, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    });
    req.user = user ; 
    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      data: {
        username: user.username,
        email: user.email,
        userId: user.userId,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("GitHub OAuth Error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
