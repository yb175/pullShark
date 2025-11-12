import express from "express" ; 
import { connectDB } from "./config/mongodbconfig.js";
import dotenv from "dotenv" 
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import redisConnect from "./config/redisConnect.js";
const app = express() ;
app.use(cookieParser())
app.use(express.json()) ;
dotenv.config() ; 
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