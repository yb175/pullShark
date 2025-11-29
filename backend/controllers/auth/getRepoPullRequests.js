import getDecryptedGithubToken from "../../utils/decryptGithubToken.js";
import axios from "axios";

export default async function getRepoPullRequests(req, res) {
  try {
    // Use authenticated user
    const user = req.user;
    if (!user || !user.userId) return res.status(401).json({ success: false, message: "User not authenticated" });
 const accesstoken = req.cookies.accesstoken;
  if (!accesstoken) return res.status(401).json({ success: false, message: "GitHub token not found" });
    const payload = await getDecryptedGithubToken(accesstoken);
   // console.log(payload);
    if (!payload) return res.status(401).json({ success: false, message: "GitHub data not found" });

    // Repo name comes from the URL; owner is the authenticated user's GitHub username
    const repo = req.params.repo;
    // console.log(repo);
    
    const owner = user.username;
    if (!repo) return res.status(400).json({ success: false, message: "Missing repo name" });
    //console.log(payload.ghAccessToken);

    const per_page = (req.pagination && req.pagination.limit) ? req.pagination.limit : 5;
    const page = (req.pagination && req.pagination.page) ? req.pagination.page : 1;

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: { Authorization: `token ${payload.ghAccessToken}` },
      params: { state: "open", per_page, page }
    });
    res.json({ success: true, pulls: response.data, pagination: req.pagination || { limit: per_page, page } });
  } catch (err) {
    console.error("getRepoPullRequests error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}