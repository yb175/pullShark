import express from "express";
import redirectUser from "../controllers/auth/redirect.js";
import exchangeToken from "../controllers/auth/exchangecode.js";
import refreshTokenMiddleware  from "../middlewares/refreshTokenMiddleware.js";
import logoutUser from "../controllers/auth/logoutuser.js";
import checkBlacklistedToken from "../middlewares/checkBlacklistedToken.js";
const authRouter = express.Router();
import rateLimiter from "../middlewares/ratelimiter.js";

authRouter.get("/redirect", rateLimiter, redirectUser);
authRouter.get("/exchange/:code",  exchangeToken);
authRouter.get("/logout", checkBlacklistedToken, logoutUser);
authRouter.get("/status",rateLimiter, checkBlacklistedToken,refreshTokenMiddleware, (req, res) => res.status(200).json({ success: true, message: "Authenticated" }));
export default authRouter;