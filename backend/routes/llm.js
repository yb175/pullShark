import express from "express"
import analysePr from "../controllers/llm/analysePr.js"
const llmRouter = express.Router() 
llmRouter.post("/analysePr/:owner/:repo/:prNumber",analysePr) ; 
export default llmRouter