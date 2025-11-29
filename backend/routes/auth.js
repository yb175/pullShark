import express from "express";
import redirectUser from "../controllers/auth/redirect.js";
import exchangeToken from "../controllers/auth/exchangecode.js";
import refreshTokenMiddleware from "../middlewares/refreshTokenMiddleware.js";
import logoutUser from "../controllers/auth/logoutuser.js";
import checkBlacklistedToken from "../middlewares/checkBlacklistedToken.js";
import getUserRepos from "../controllers/auth/getUserRepos.js";
import getRepoPullRequests from "../controllers/auth/getRepoPullRequests.js";
import paginationMiddleware from "../middlewares/pagination.js";
const authRouter = express.Router();
import rateLimiter from "../middlewares/ratelimiter.js";
import callback from "../controllers/auth/callback.js";

authRouter.get("/redirect", rateLimiter, redirectUser);
authRouter.get("/exchange/:code", exchangeToken);
authRouter.get("/logout", checkBlacklistedToken, logoutUser);
authRouter.get("/callback", callback);

// Secured endpoints: require not-blacklisted + refresh middleware to attach req.user
authRouter.get(
  "/repos",
  checkBlacklistedToken,
  refreshTokenMiddleware,
  paginationMiddleware,
  getUserRepos
);
// Single param `repo` — owner inferred from authenticated user
authRouter.get(
  "/repos/:repo/pulls",
  checkBlacklistedToken,
  refreshTokenMiddleware,
  paginationMiddleware,
  getRepoPullRequests
);

authRouter.get(
  "/status",
  rateLimiter,
  checkBlacklistedToken,
  refreshTokenMiddleware,
  (req, res) => {
    const {
      ghAccessToken,
      ghRefreshToken,
      ghAccessTokenExpiresAt,
      ghRefreshTokenExpiresAt,
      refreshTokenExpiresAt,
      createdAt,
      updatedAt,
      __v,
      ...safeUser
    } = req.user.toObject ? req.user.toObject() : req.user;

    res.status(200).json({
      success: true,
      message: "Authenticated",
      user: safeUser,
    });
  }
);
export default authRouter;
