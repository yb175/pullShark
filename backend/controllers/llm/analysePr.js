import axios from "axios";
import getDecryptedGithubToken from "../../utils/decryptGithubToken.js";
import { encode } from "@toon-format/toon";
import cleanDiff from "../../utils/cleandiff.js";
import compressForLLM from "../../utils/compressllm.js";
import prioritizeFiles from "../../utils/smartfile.js";

export default async function analysePr(req, res) {
  try {
    const accesstoken = req.cookies.accesstoken;
    if (!accesstoken) {
      return res.status(401).json({
        success: false,
        message: "github token not found",
      });
    }

    const payload = await getDecryptedGithubToken(accesstoken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "github data not found",
      });
    }

    const { owner, repo, prNumber } = req.params;
    const headers = {
      Authorization: `token ${payload.ghAccessToken}`,
      "User-Agent": "pullshark",// ye bheja h kyuki github api me user-agent dena zaruri hota h
    };

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

    const [metaRes, diffRes, filesRes] = await Promise.all([
      axios.get(baseUrl, { headers }),
      axios.get(baseUrl, {
        headers: { ...headers, Accept: "application/vnd.github.v3.diff" },
      }),
      axios.get(`${baseUrl}/files`, { headers }),
    ]);

    // Apply all optimizations
    const cleanedDiff = cleanDiff(diffRes.data);
    const prioritizedFiles = prioritizeFiles(filesRes.data);

    const minimalResponse = compressForLLM({
      title: metaRes.data.title,
      description: metaRes.data.body,
      author: metaRes.data.user?.login,
      changedFiles: prioritizedFiles.map((f) => f.filename),
      diff: cleanedDiff,
    });

    const encoded = encode(minimalResponse);
    const sizeInBytes = Buffer.byteLength(encoded, "utf8");
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const base64Payload = Buffer.from(encoded, "utf8").toString("base64");
    // console.log(base64Payload);
    const response = await fetch(
      "https://pullshark-ai.onrender.com/api/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pr: base64Payload }),
      }
    );

    const data = await response.json();

    // console.log(data);
    return res.status(200).json({
      success: true,
      sizeInKB,
      sizeInBytes,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
