import getDecryptedGithubToken from "../../utils/decryptGithubToken.js";
import axios from "axios";

export default async function getUserRepos(req, res) {
  try {
    const user = req.user;
    if (!user || !user.userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const accessToken = req.cookies.accesstoken;
    if (!accessToken) {
      return res.status(401).json({ success: false, message: "GitHub token not found" });
    }

    const payload = await getDecryptedGithubToken(accessToken);

    const per_page = 100;
    let page = 1;
    let allRepos = [];

    while (true) {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: { Authorization: `token ${payload.ghAccessToken}` },
        params: { page, per_page, sort: "updated" }
      });

      const repos = response.data || [];

      const filtered = repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        url: repo.url,

        owner: repo.owner ? {
          login: repo.owner.login,
          id: repo.owner.id,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
          type: repo.owner.type
        } : null,

        html_url: repo.html_url,
        description: repo.description,
        forks_count: repo.forks_count,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        open_issues_count: repo.open_issues_count,
        language: repo.language
      }));

      allRepos = allRepos.concat(filtered);

      if (repos.length < per_page) break;
      page++;
    }

    return res.json({ success: true, repos: allRepos });

  } catch (err) {
    console.error("getUserRepos error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}
