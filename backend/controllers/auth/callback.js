export default function callback(req, res) {
    const code = req.query.code;
    res.redirect(`http://localhost:5173/login?code=${code}`);
}