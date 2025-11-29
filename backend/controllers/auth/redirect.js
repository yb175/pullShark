/**
 * GitHub OAuth Redirect Handler
 * 
 * This function initiates the GitHub OAuth 2.0 authorization flow by redirecting users
 * to GitHub's authorization endpoint with the necessary parameters.
 * 
 * @param {Object} req - The HTTP request object (Express.js request)
 * @param {Object} res - The HTTP response object (Express.js response)
 * 
 * @description
 * - Constructs the GitHub authorization URL with required OAuth parameters
 * - Sets the client ID from environment variables
 * - Specifies the callback URL for GitHub to redirect back after authorization
 * - Requests specific OAuth scopes for accessing user data and repositories
 * - Performs a 302 redirect to GitHub's authorization page
 * 
 * @oauth_scopes
 * - read:user - Access to read user profile data
 * - user:email - Access to user email addresses
 * - repo - Access to user repositories (read/write)
 * 
 * @environment_variables
 * - GITHUB_CLIENT_ID - GitHub OAuth app client ID
 * - GITHUB_CALLBACK_URL - URL where GitHub redirects after authorization
 * 
 * @example
 * // User visits endpoint triggering this function
 * // Gets redirected to: https://github.com/login/oauth/authorize?client_id=123&redirect_uri=https://app.com/callback&scope=read:user%20user:email%20repo
 */

export default function redirectUser(req, res) {
    const callbackBase =
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3000/auth/callback";

    const redirectURL = 
        `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(callbackBase)}` +
        `&scope=read:user%20user:email%20repo`;

    return res.redirect(redirectURL);
}
