import dotenv from "dotenv";
dotenv.config();
export default function appInstalled(req,res){
    res.redirect(`${process.env.FRONTEND_URL}/repo`);
}