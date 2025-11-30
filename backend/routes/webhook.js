import express from "express"; // import express to create a router
import handleWebhook from "../controllers/webhook/handleWebhook.js"; // import the handler that will verify and process the webhook
import getInstallationId from "../controllers/webhook/getInstallationId.js";  
import refreshGitHubTokenMiddleware from "../middlewares/refreshTokenMiddleware.js";  
const router = express.Router(); // create a new router instance
import checkBlacklistedToken from "../middlewares/checkBlacklistedToken.js";
// Use express.raw so the handler receives the raw bytes for signature verification
router.post("/handle", express.raw({ type: "*/*" }), handleWebhook);
router.get(`/app-installed`, checkBlacklistedToken,refreshGitHubTokenMiddleware,getInstallationId);
export default router; // export the configured router
