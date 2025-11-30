import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  // OAuth user info
  userId: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: { type: String, default: "" },

  // OAuth tokens 
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },

  // GitHub App — REQUIRED
  installationId: { type: Number },            
  installationActive: { type: Boolean, default: false }, // for uninstall

  // Basic stats
  usageStats: { 
    testRuns: { type: Number, default: 0 }
  }
}, { timestamps: true });

const UserModel = mongoose.model("user" , userSchema) 
export default UserModel