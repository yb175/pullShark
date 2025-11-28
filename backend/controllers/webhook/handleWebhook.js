import crypto from "crypto"; // crypto used to compute HMAC for signature verification
import axios from "axios"; // axios used to fetch diff and files from GitHub when needed
import { encode } from "@toon-format/toon"; // same encoder used by analysePr
import cleanDiff from "../../utils/cleanDIff.js"; // reuse diff cleaning utility
import compressForLLM from "../../utils/compressllm.js"; // reuse compressor for model payload
import prioritizeFiles from "../../utils/smartfile.js"; // reuse file prioritization helper
import { writeFileSync, mkdirSync, existsSync } from "fs"; // for optional debug persistence

// Controller: handle incoming GitHub webhooks and forward PR data to the model pipeline
export default async function handleWebhook(req, res) {
  // Verify signature: we compute HMAC over the raw body and compare to header
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET; // read secret from environment
    if (!secret) {
      // If secret is not set, we cannot verify signatures — return 500 to indicate misconfiguration
      return res.status(500).json({ success: false, message: "GITHUB_WEBHOOK_SECRET not configured" });
    }

    const signatureHeader = req.headers["x-hub-signature-256"] || req.headers["x-hub-signature"]; // signature header(s)
    if (!signatureHeader) {
      // If GitHub did not send a signature header, this is suspicious — reject
      return res.status(400).json({ success: false, message: "Missing signature header" });
    }

    const rawBody = req.body; // because route uses express.raw, req.body is the raw Buffer
    if (!rawBody) {
      // Lack of raw body means we cannot verify — reject
      return res.status(400).json({ success: false, message: "Missing raw body" });
    }

    // Compute HMAC-SHA256 of the raw body using the webhook secret
    const computedHash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedSignature = `sha256=${computedHash}`; // GitHub sends header in this format

    const sigBuf = Buffer.from(signatureHeader); // convert header to Buffer
    const expBuf = Buffer.from(expectedSignature); // convert expected to Buffer

    // Use timingSafeEqual to prevent timing attacks during comparison
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      // Signature mismatch — reject with 401 Unauthorized
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    // If verification succeeded, parse payload from raw body
    let payload = null;
    try {
      payload = JSON.parse(rawBody.toString()); // parse JSON payload from raw bytes
    } catch (err) {
      // If parsing fails, respond with bad request
      return res.status(400).json({ success: false, message: "Invalid JSON payload" });
    }

    const event = req.headers["x-github-event"] || req.headers["x-hub-event"]; // event name header

    // Only handle pull_request events for now
    if (event !== "pull_request") {
      // For other events, acknowledge and return 200
      return res.status(200).json({ success: true, message: `Ignored event: ${event}` });
    }

    // Extract useful PR data from payload
    const action = payload.action; // action performed on PR (opened, edited, reopened, synchronize...)
    const pr = payload.pull_request; // the pull_request object
    const repo = payload.repository; // repository object
    const owner = repo?.owner?.login || pr?.head?.repo?.owner?.login; // owner login fallback
    const repoName = repo?.name || pr?.head?.repo?.name; // repo name fallback
    const prNumber = pr?.number; // PR number

    // We only process certain actions: opened, reopened, synchronize (new commits), edited
    const actionable = ["opened", "reopened", "synchronize", "edited"];
    if (!actionable.includes(action)) {
      // Acknowledge non-actionable PR events
      return res.status(200).json({ success: true, message: `Action ${action} ignored` });
    }

    // Prepare headers for GitHub API requests. Use optional token if configured to avoid rate limits.
    const ghToken = process.env.GITHUB_WEBHOOK_TOKEN || null; // optional token
    const headers = { "User-Agent": "pullshark" }; // user-agent required by GitHub API
    if (ghToken) headers.Authorization = `token ${ghToken}`; // attach token if provided

    // Fetch diff and files to replicate analysePr behavior
    // diff_url is provided in the PR object; use it to fetch the raw diff
    const diffUrl = pr.diff_url; // diff URL for the PR
    let diffText = ""; // initialize diff string
    try {
      const diffRes = await axios.get(diffUrl, { headers, responseType: "text" }); // get diff as text
      diffText = diffRes.data; // raw diff
    } catch (err) {
      // If diff fetch fails, continue with empty diff but log the error
      console.warn("Failed to fetch diff:", err.message);
      diffText = "";
    }

    // Fetch changed files list using PR files API endpoint
    let filesList = [];
    try {
      const filesUrl = pr.url + "/files"; // API endpoint to get changed files of the PR
      const filesRes = await axios.get(filesUrl, { headers }); // fetch files
      filesList = filesRes.data; // array of files with metadata
    } catch (err) {
      // If files fetch fails, log and continue with empty list
      console.warn("Failed to fetch PR files:", err.message);
      filesList = [];
    }

    // Reuse the same preprocessing used by analysePr: clean diff and prioritize files
    const cleanedDiff = cleanDiff(diffText); // clean diff to remove noise
    const prioritized = prioritizeFiles(filesList); // rank files by importance

    // Build minimal payload expected by compressForLLM (same shape as analysePr)
    const minimalResponse = compressForLLM({
      title: pr.title, // PR title
      description: pr.body, // PR description / body
      author: pr.user?.login, // PR author login
      changedFiles: prioritized.map((f) => f.filename), // list of filenames
      diff: cleanedDiff, // cleaned diff text
    });

    // Encode and base64 the payload to send to the same external analyze endpoint
    const encoded = encode(minimalResponse); // toon-encode the compressed payload
    const base64Payload = Buffer.from(encoded, "utf8").toString("base64"); // base64 encode

    // Optionally persist the payload for debugging into ./tmp
    try {
      if (!existsSync("./tmp")) mkdirSync("./tmp"); // ensure tmp dir exists
      writeFileSync(`./tmp/webhook-pr-${owner}-${repoName}-${prNumber}.json`, JSON.stringify({ minimalResponse }, null, 2)); // write debug file
    } catch (err) {
      // ignore write errors
    }

    // Send payload to model analyze endpoint (same endpoint used in analysePr)
    try {
      const response = await axios.post(
        "https://pullshark-ai.onrender.com/api/analyze",
        { pr: base64Payload },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data; // response from model service

      // Return success and include the model response for debugging
      return res.status(200).json({ success: true, model: data });
    } catch (err) {
      // If model call fails, log and return 500
      console.error("Model analyze call failed:", err.message);
      return res.status(500).json({ success: false, message: "Model analyze failed" });
    }
  } catch (err) {
    // Catch-all for unexpected errors in webhook processing
    console.error("Webhook handler error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}
