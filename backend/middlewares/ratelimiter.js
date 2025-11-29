
import redisClient from "../config/redisClient.js";

// Fixed window size and max requests
const windowSize = 60; // seconds
const maxRequests = 60; // max requests per window

export default async function rateLimiter(req, res, next) {
	try {
		const key = `rl_${req.ip}`;
		const now = Date.now();
		const windowStart = now - windowSize * 1000;

		// Remove old timestamps
		await redisClient.zRemRangeByScore(key, 0, windowStart);

		// Get current count
		const reqCount = await redisClient.zCard(key);

		if (reqCount >= maxRequests) {
			return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
		}
        console.log("Request count: " + reqCount);
		// Add current timestamp
		await redisClient.zAdd(key, [{ score: now, value: `${now}` }]);
		// Set expiry for the key
		await redisClient.expire(key, windowSize);

		next();
	} catch (err) {
		return res.status(500).json({ success: false, message: "Rate limiter error" });
	}
}

