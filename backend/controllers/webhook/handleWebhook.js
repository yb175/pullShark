import crypto from "crypto";
import axios from "axios";
import { encode } from "@toon-format/toon";
import sendEmail from "../../utils/sendEmail.js"; // Import the email utility
import cleanDiff from "../../utils/cleandiff.js";
import compressForLLM from "../../utils/compressllm.js";
import prioritizeFiles from "../../utils/smartfile.js";
import { log } from "console"; // Keep this if you use log() elsewhere
import { generateInstallationToken } from "../../utils/githubjwt.js";
// Controller: handle incoming GitHub webhooks
export default async function handleWebhook(req, res) {
  try {
    // Signature secret verify
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ success: false, message: "Missing webhook secret" });
    }

    const signatureHeader =
      req.headers["x-hub-signature-256"] || req.headers["x-hub-signature"];
    if (!signatureHeader) {
      return res
        .status(400)
        .json({ success: false, message: "Missing signature header" });
    }

    const rawBody =
      req.rawBody && Buffer.isBuffer(req.rawBody)
        ? req.rawBody
        : req.body && Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(JSON.stringify(req.body || {}));

    const computedHash = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedSignature = `sha256=${computedHash}`;

    const sigBuf = Buffer.from(signatureHeader);
    const expBuf = Buffer.from(expectedSignature);
    console.log("I am working till line 41");
    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid signature" });
    }

    // Parse payload
    const payload = JSON.parse(rawBody.toString());
    console.log("Webhook received:", payload.action);

    const event = req.headers["x-github-event"];
    if (event !== "pull_request") {
      console.log("IGNORED EVENT:", event);
      return res
        .status(200)
        .json({ success: true, message: `Ignored event ${event}` });
    }

    const action = payload.action;
    console.log(action);
    const actionable = [
      "opened",
      "reopened",
      "synchronize",
      "edited",
      "created",
    ];
    if (!actionable.includes(action)) {
      return res
        .status(200)
        .json({ success: true, message: `PR action ignored` });
    }
    console.log(action);
    const pr = payload.pull_request;
    const repo = payload.repository;
    const installationId = payload.installation?.id;
    console.log(installationId);
    if (!installationId) {
      return res
        .status(400)
        .json({ success: false, message: "No installation id" });
    }

    // --- Get installation token ---
    const installationToken = await generateInstallationToken(installationId);
    const ghHeaders = {
      Authorization: `token ${installationToken}`,
      "User-Agent": "pullshark",
    };

    // --- Fetch commit author email ---
    // Email: analysis started
    console.log("preparation started");//
    // --- Fetch commit author email ---
    let userEmail = req?.user?.email || "";
    console.log(userEmail || "ni aayi");
    try {
      const commits = (await axios.get(pr.commits_url, { headers: ghHeaders }))
        .data;
      if (commits && commits.length > 0) {
        userEmail = commits.at(-1).commit.author.email;
      }
    } catch (err) {
      console.warn("Commit email fetch failed:", err.message);
    }

    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: `[PullShark] Analysis started for PR #${pr.number}`,
        text: `We are analyzing your PR: "${pr.title}"`,
      }).catch(() => {});
    }

    // --- Fetch diff ---
    let diffText = "";
    try {
      diffText = (
        await axios.get(pr.diff_url, {
          headers: ghHeaders,
          responseType: "text",
        })
      ).data;
    } catch (err) {
      console.warn("Diff fetch failed:", err.message);
    }

    // --- Fetch changed files ---
    let filesList = [];
    try {
      filesList = (await axios.get(pr.url + "/files", { headers: ghHeaders }))
        .data;
    } catch (err) {
      console.warn("Files fetch failed:", err.message);
    }

    // Prepare LLM payload
    const cleanedDiff = cleanDiff(diffText);
    const prioritized = prioritizeFiles(filesList);

    const minimalResponse = compressForLLM({
      title: pr.title,
      description: pr.body,
      author: pr.user?.login,
      changedFiles: prioritized.map((f) => f.filename),
      diff: cleanedDiff,
    });

    const encoded = encode(minimalResponse);
    const base64Payload = Buffer.from(encoded, "utf8").toString("base64");

    // --- Call your model ---
    const modelResp = await axios.post(
      "https://pullshark-ai.onrender.com/api/analyze",
      { pr: base64Payload },
      { headers: { "Content-Type": "application/json" } }
    );
   // console.log("Model response:", "response aagaya");//

    // --- Extract pre-formatted comment from model response ---
    const commentText =
      modelResp.data?.formatted_comment ||
      "PullShark analysis complete. No specific feedback provided.";

    // --- Post a comment on the PR ---
    try {
      await axios.post(
        pr.comments_url,
        { body: commentText },
        { headers: ghHeaders }
      );
      console.log(`Comment posted on PR #${pr.number}`);
    } catch (err) {
      console.error("Failed to post PR comment:", err.message);
    }

    // Email: analysis done
    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: `[PullShark] Analysis complete`,
        text: `Your analysis is complete. We've added a comment to your PR with the details.\n\n${commentText}`,
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      model: modelResp.data,
    });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}
