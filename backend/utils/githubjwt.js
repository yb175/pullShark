import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
function generateAppJWT() {
  const privateKey = process.env.GITHUB_PRIVATE_KEY;

  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 540, // 9 minutes
    iss: process.env.GITHUB_APP_ID,
  };

  return jwt.sign(payload, privateKey, { algorithm: "RS256" });
}

export async function generateInstallationToken(installationId) {
  const jwtToken = generateAppJWT();

  const res = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  return res.data.token;
}
