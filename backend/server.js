import express from "express" ; 
import { connectDB } from "./config/mongodbconfig.js";
import dotenv from "dotenv" 
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import redisConnect from "./config/redisConnect.js";
import cors from "cors"
const app = express() ;
app.use(cookieParser())
app.use(express.json()) ;
app.use(cors()) ; 
app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true,                 
}));
dotenv.config() ; 
app.use(express.urlencoded({extended:true})) ;
app.use(cors({
    origin: process.env.FRONTEND_URL||"http://localhost:5173",
    credentials:true,
}))
app.use("/auth", authRouter) ;

const promises = [connectDB(),redisConnect()] ;
async function start() {
    try{
        await Promise.all(promises) ; 
        const PORT = process.env.PORT || 3000 ;
        app.listen(PORT,()=>console.log("Server started at port 3000")) ; 
    }catch(err){
        console.log(err) ; 
    }
}
start() ; 