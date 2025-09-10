const jwt = require("jsonwebtoken");
const { User } = require("kybervision18db");

async function authenticateToken(req, res, next) {
	if (process.env.AUTHENTIFICATION_TURNED_OFF === "true") {
		const user = await User.findOne({ where: { email: "nrodrig1@gmail.com" } });
		req.user = { id: user.id };
		return next();
	}

	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) {
		return res.status(401).json({ message: "Token is required" });
	}

	jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
		if (err) return res.status(403).json({ message: "Invalid token" });
		const { id } = decoded;
		const user = await User.findByPk(id);
		req.user = user;
		next();
	});
}

function tokenizeObject(object) {
	return jwt.sign(object, process.env.JWT_SECRET);
}

function detokenizeObject(token) {
	return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
	authenticateToken,
	tokenizeObject,
	detokenizeObject,
};
