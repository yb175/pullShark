import mongoose from "mongoose";

const connectedRepoSchema = new mongoose.Schema({
  repoId: { type: String, required: true },
  repoName: { type: String, required: true },
  role: { type: String, enum: ["owner", "collaborator", "contributor"], required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: { type: String, default: ""},
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  connectedRepos: [connectedRepoSchema],
  usageStats: { testRuns: { type: Number, default: 0 } },
}, { timestamps: true });


const UserModel = mongoose.model("user" , userSchema) 
export default UserModel