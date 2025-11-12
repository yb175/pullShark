import express from "express";
import redirectUser from "../controllers/auth/redirect.js";
import exchangeToken from "../controllers/auth/exchangecode.js";
import refreshTokenController from "../controllers/auth/refreshToken.js";
import logoutUser from "../controllers/auth/logoutuser.js";
const authRouter = express.Router();

authRouter.get("/redirect", redirectUser);
authRouter.get("/exchange/:code", exchangeToken);
authRouter.post("/refresh", refreshTokenController);
authRouter.get("/logout", logoutUser);

export default authRouter;