import express from "express"; // import express to create a router
import handleWebhook from "../controllers/webhook/handleWebhook.js"; // import the handler that will verify and process the webhook

const router = express.Router(); // create a new router instance

// Use express.raw so the handler receives the raw bytes for signature verification
router.post("/", express.raw({ type: "*/*" }), handleWebhook);

export default router; // export the configured router
