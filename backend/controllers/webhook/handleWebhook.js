import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { analysisQueue } from "../../queues/analysis.queue.js";
import { Prisma } from "@prisma/client";
// NOTE : HEAVY LOGIC WOULD MOVE TO WORKER


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
    const actionable = ["opened", "reopened", "synchronize", "edited"];
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

    let analysisRun;
    try {
      analysisRun = await prisma.analysisRun.create({
        data: {
          pr_number: pr.number,
          pr_owner: pr.user.login,
          repo_name: repo.name,
          commit_sha: pr.head.sha,
        },
      });
      console.log("Added into queue") ; 
      await analysisQueue.add(
        "analyze-pr",
        {
          analysisRunId: analysisRun.id,
          installationId,
        },
        {
          jobId: analysisRun.id, // queue-level idempotency
        },
      );
    } catch(error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        console.log("Allready queued");
        // Already queued → idempotent no-op
        return res.status(200).json({ success: true });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}
