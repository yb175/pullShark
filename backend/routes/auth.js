import express from "express";
import redirectUser from "../controllers/auth/redirect.js";
import exchangeToken from "../controllers/auth/exchangecode.js";
import refreshTokenController from "../controllers/auth/refreshToken.js";
import logoutUser from "../controllers/auth/logoutuser.js";
import checkBlacklistedToken from "../middlewares/checkBlacklistedToken.js";
const authRouter = express.Router();

authRouter.get("/redirect", redirectUser);
authRouter.get("/exchange/:code", checkBlacklistedToken, exchangeToken);
authRouter.post("/refresh", checkBlacklistedToken, refreshTokenController);
authRouter.get("/logout", checkBlacklistedToken, logoutUser);

export default authRouter;