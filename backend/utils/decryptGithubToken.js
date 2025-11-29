import jwt from "jsonwebtoken";
import UserModel from "../models/user/userSchema.js";

// original token nikalne k liye bas user id ke sath call jkrna h 
export default async function getDecryptedGithubToken(accesstoken) {

  try {
    const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (err) {
    return null;
  }
}
