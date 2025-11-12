import jwt from "jsonwebtoken";
import UserModel from "../models/user/userSchema.js";

// original token nikalne k liye bas user id ke sath call jkrna h 
export default async function getDecryptedGithubToken(userId) {
  const user = await UserModel.findOne({ userId });
  if (!user || !user.accessToken) return null;
  try {
    const decoded = jwt.verify(user.accessToken, process.env.JWT_SECRET_KEY);
    return decoded.access_token;
  } catch (err) {
    return null;
  }
}