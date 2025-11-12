
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

    const access_token = tokenResponse.data.access_token;
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


    // Encrypting the GitHub token using jwt before sorting
    const encryptedAccessToken = jwt.sign(
      { access_token },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    let user = await UserModel.findOne({ userId: ghUser.id });
    if (!user) {
      user = new UserModel({
        userId: ghUser.id,
        email: ghUser.email || `${ghUser.login}@users.noreply.github.com`,
        username: ghUser.login,
        accessToken: encryptedAccessToken,
      });
    } else {
      user.accessToken = encryptedAccessToken;
    }

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      {
        id: user.userId,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "2hr" } // access token vaise 1hr ya usse kam rkhna chiye
    );

    const refreshToken = jwt.sign(
      {
        id: user.userId,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "7d" } // refresh token abhi k liye 7 din bad expire hoga
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accesstoken", accessToken, { httpOnly: true, maxAge:  2 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      data: {
        username: user.username,
        email: user.email,
        userId: user.userId,
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
