import crypto from "crypto";
import axios from "axios";
import { encode } from "@toon-format/toon";
import sendEmail from "../../utils/sendEmail.js"; // Import the email utility
import cleanDiff from "../../utils/cleanDIff.js";
import compressForLLM from "../../utils/compressllm.js";
import prioritizeFiles from "../../utils/smartfile.js";
import { log } from "console"; // Keep this if you use log() elsewhere

// Controller: handle incoming GitHub webhooks
export default async function handleWebhook(req, res) {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: "GITHUB_WEBHOOK_SECRET not configured" });
    }

    const signatureHeader =
      req.headers["x-hub-signature-256"] || req.headers["x-hub-signature"];
    if (!signatureHeader) {
      return res.status(400).json({ success: false, message: "Missing signature header" });
    }

    // -------------------------
    // FIXED RAW BODY HANDLING
    // -------------------------
    const rawBody =
      req.rawBody && Buffer.isBuffer(req.rawBody)
        ? req.rawBody
        : req.body && Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(JSON.stringify(req.body || {}));

    if (!rawBody || !rawBody.length) {
      return res.status(400).json({ success: false, message: "Missing raw body" });
    }

    // Signature compute
    const computedHash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedSignature = `sha256=${computedHash}`;

    const sigBuf = Buffer.from(signatureHeader);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(rawBody.toString());
      console.log("Webhook payload received");
    } catch {
      return res.status(400).json({ success: false, message: "Invalid JSON payload" });
    }

    const event = req.headers["x-github-event"] || req.headers["x-hub-event"];
    if (event !== "pull_request") {
      return res.status(200).json({ success: true, message: `Ignored event: ${event}` });
    }

    const action = payload.action;
    const pr = payload.pull_request;
    const repo = payload.repository;
    const owner = repo?.owner?.login || pr?.head?.repo?.owner?.login;
    const repoName = repo?.name || pr?.head?.repo?.name;
    const prNumber = pr?.number;

    const actionable = ["opened", "reopened", "synchronize", "edited"];
    if (!actionable.includes(action)) {
      return res.status(200).json({ success: true, message: `Action ${action} ignored` });
    }

    const headers = { "User-Agent": "pullshark" };

    // --- EMAIL LOGIC: Fetch user email from commit ---
    let userEmail = null;
    try {
      const commitsUrl = pr.commits_url;
      const commits = (await axios.get(commitsUrl, { headers })).data;
      if (commits && commits.length > 0) {
        // Get email from the author of the latest commit
        userEmail = commits[commits.length - 1].commit.author.email;
        console.log(`Found user email from commit: ${userEmail}`);
      }
    } catch (err) {
      console.warn("Could not fetch commit details to get user email:", err.message);
    }

    // --- EMAIL LOGIC: Send "Analysis Started" email ---
    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: `[PullShark] Analysis started for PR #${prNumber}`,
        text: `Hi ${pr.user?.login},\n\nWe've started analyzing your pull request: "${pr.title}".\n\nYou'll receive another email once the analysis is complete.\n\n- The PullShark Team`,
        html: `<p>Hi ${pr.user?.login},</p><p>We've started analyzing your pull request: "<strong>${pr.title}</strong>".</p><p>You'll receive another email once the analysis is complete.</p><p>- The PullShark Team</p>`,
      }).catch(err => console.error("Failed to send 'analysis started' email:", err.message));
    }

    // Fetch diff
    const diffUrl = pr.diff_url;
    let diffText = "";
    try {
      diffText = (await axios.get(diffUrl, { headers, responseType: "text" })).data;
    } catch (err) {
      console.warn("Failed to fetch diff:", err.message);
    }

    // Fetch changed files
    let filesList = [];
    try {
      const filesUrl = pr.url + "/files";
      filesList = (await axios.get(filesUrl, { headers })).data;
    } catch (err) {
      console.warn("Failed to fetch PR files:", err.message);
    }

    const cleanedDiff = cleanDiff(diffText);
    const prioritized = prioritizeFiles(filesList);

    const minimalResponse = compressForLLM({
      title: pr.title,
      description: pr.body,
      author: pr.user?.login,
      changedFiles: prioritized.map(f => f.filename),
      diff: cleanedDiff,
    });

    const encoded = encode(minimalResponse);
    const base64Payload = Buffer.from(encoded, "utf8").toString("base64");

    try {
      const response = await axios.post(
        "https://pullshark-ai.onrender.com/api/analyze",
        { pr: base64Payload },
        { headers: { "Content-Type": "application/json" } }
      );

      // --- EMAIL LOGIC: Send "Analysis Complete" email ---
      if (userEmail) {
        // Assuming response.data contains the analysis text or object
        const analysisResult = JSON.stringify(response.data, null, 2);

        sendEmail({
          to: userEmail,
          subject: `[PullShark] Analysis complete for PR #${prNumber}`,
          text: `Hi ${pr.user?.login},\n\nYour pull request analysis is complete.\n\nResult:\n${analysisResult}\n\n- The PullShark Team`,
          html: `<p>Hi ${pr.user?.login},</p><p>Your pull request analysis is complete.</p><h3>Result:</h3><pre><code>${analysisResult}</code></pre><p>- The PullShark Team</p>`,
        }).catch(err => console.error("Failed to send 'analysis complete' email:", err.message));
      }
      // --- END EMAIL LOGIC ---

      return res.status(200).json({ success: true, model: response.data });
    } catch (err) {
      console.error("Model analyze call failed:", err.message);
      return res.status(500).json({ success: false, message: "Model analyze failed" });
    }
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}
