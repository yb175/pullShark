import express, { urlencoded } from "express" ; 
import { connectDB } from "./config/mongodbconfig.js";
import dotenv from "dotenv" 
import authRouter from "./routes/auth.js";
import llmRouter from "./routes/llm.js";
import webhookRouter from "./routes/webhook.js";
import cookieParser from "cookie-parser";
import redisConnect from "./config/redisConnect.js";
import cors from "cors";
// 🦈 Release the worker shark! Processing PR analysis right alongside Express 🚀
import "./worker/analysis.worker.js";
dotenv.config() ; 
const app = express() ;
app.set("trust proxy", 1);


app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is up"
  });
});
app.use(express.urlencoded({extended:true, verify: (req, res, buf) => { req.rawBody = buf; } })) ;
app.use("/auth", authRouter) ;
app.use("/llm", llmRouter) ;
app.use("/webhook", webhookRouter);
const promises = [connectDB(),redisConnect()] ;
async function start() {
    try{
        await Promise.all(promises) ; 
        const PORT = process.env.PORT || 3000 ;
        app.listen(PORT,"0.0.0.0",()=>console.log(`Server started at port ${PORT}`)) ; 
    }catch(err){
        console.log(err) ; 
    }
}
start() ; 
