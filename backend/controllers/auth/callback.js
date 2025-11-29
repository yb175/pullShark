export default function callback(req, res) {
    const code = req.query.code;

    // Fallback logic:
    // 1) PRIORITY: ENV variable (ideal for production)
    // 2) FALLBACK: Production domain
    // 3) LAST FALLBACK: Localhost (dev mode)
    const redirectBase =
        process.env.FRONTEND_URL || 
        "http://pullshark.site" || 
        "http://localhost:5173";

    return res.redirect(`${redirectBase}/login?code=${code}`);
}
