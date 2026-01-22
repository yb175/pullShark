import axios from "axios";
import { encode } from "@toon-format/toon";
import sendEmail from "../utils/sendEmail.js";
import cleanDiff from "../utils/cleandiff.js";
import compressForLLM from "../utils/compressllm.js";
import prioritizeFiles from "../utils/smartfile.js";
import { generateInstallationToken } from "../utils/githubjwt.js";
import { prisma } from "../lib/prisma.js";

/**
 * Core analysis service
 * This function preserves OG webhook functionality 1:1
 */
export default async function runAnalysis({ analysisRunId, installationId }) {
  // context for analysis run
  const analysisRun = await prisma.analysisRun.findUnique({
    where: { id: analysisRunId },
  });

  if (!analysisRun) {
    throw new Error("AnalysisRun not found");
  }

  const { pr_owner, repo_name, pr_number } = analysisRun;

  // fetching authentication token
  const installationToken = await generateInstallationToken(installationId);
  const ghHeaders = {
    Authorization: `token ${installationToken}`,
    "User-Agent": "pullshark",
  };

  // pr meta data
  const prResp = await axios.get(
    `https://api.github.com/repos/${pr_owner}/${repo_name}/pulls/${pr_number}`,
    { headers: ghHeaders },
  );

  const pr = prResp.data;

  // fetch email
  let userEmail = "";

  try {
    const commits = (await axios.get(pr.commits_url, { headers: ghHeaders }))
      .data;

    if (commits && commits.length > 0) {
      userEmail = commits.at(-1).commit.author.email;
    }
  } catch (err) {
    console.warn("Commit email fetch failed:", err.message);
  }

  // send email
  if (userEmail) {
    sendEmail({
      to: userEmail,
      subject: `[PullShark] Analysis started for PR #${pr.number}`,
      text: `We are analyzing your PR: "${pr.title}"`,
    }).catch(() => {});
  }

  // fetch diff
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

  // fetch files
  let filesList = [];
  try {
    filesList = (await axios.get(`${pr.url}/files`, { headers: ghHeaders }))
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

  let modelResp;

  try {
    modelResp = await axios.post(
      "https://pullshark-ai.onrender.com/api/analyze",
      { pr: base64Payload },
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.statusText ||
      err.message ||
      "Model call failed";

    // Preserve context for worker / DB
    const error = new Error(`LLM_ANALYSIS_FAILED: ${msg}`);
    error.original = err;
    throw error;
  }

  const commentText =
    modelResp.data?.formatted_comment ||
    "PullShark analysis complete. No specific feedback provided.";

  // post comment
  try {
    await axios.post(
      pr.comments_url,
      { body: commentText },
      { headers: ghHeaders },
    );
  } catch (err) {
    console.error("Failed to post PR comment:", err.message);
  }

  // email analysis complete
  if (userEmail) {
    sendEmail({
      to: userEmail,
      subject: `[PullShark] Analysis complete`,
      text: `Your analysis is complete. We've added a comment to your PR with the details.\n\n${commentText}`,
    }).catch(() => {});
  }

  // return results
  return {
    commentText,
    modelResponse: modelResp.data,
  };
}

