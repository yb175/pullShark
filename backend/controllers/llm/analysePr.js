import getDecryptedGithubToken from "../../utils/decryptGithubToken.js";
import axios from "axios";
import { encode } from "@toon-format/toon";
import cleanDiff from "../../utils/cleanDIff.js";
import compressForLLM from "../../utils/compressllm.js";
import prioritizeFiles from "../../utils/smartfile.js";
import shouldIncludeFile from "../../utils/filetypefiltering.js"; 
export default async function analysePr(req, res) {
  try {
    const accesstoken = req.cookies.accesstoken;
    if (!accesstoken) {
      return res.status(401).json({
        success: false,
        message: "github token not found"
      });
    }

    const payload = await getDecryptedGithubToken(accesstoken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "github data not found"
      });
    }

    const { owner, repo, prNumber } = req.params;
    const headers = {
      Authorization: `token ${payload.ghAccessToken}`,
      "User-Agent": "pullshark"
    };

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

    const [metaRes, diffRes, filesRes] = await Promise.all([
      axios.get(baseUrl, { headers }),
      axios.get(baseUrl, {
        headers: { ...headers, Accept: "application/vnd.github.v3.diff" }
      }),
      axios.get(`${baseUrl}/files`, { headers })
    ]);

    // Apply all optimizations
    const cleanedDiff = cleanDiff(diffRes.data);
    const prioritizedFiles = prioritizeFiles(filesRes.data);
    
    const minimalResponse = compressForLLM({
      title: metaRes.data.title,
      description: metaRes.data.body,
      author: metaRes.data.user?.login,
      changedFiles: prioritizedFiles.map(f => f.filename),
      diff: cleanedDiff
    });

    const encoded = encode(minimalResponse);
    const sizeInBytes = Buffer.byteLength(encoded, "utf8");
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    return res.status(200).json({
      success: true,
      sizeInKB,
      sizeInBytes,
      pr: encoded
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}