const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Please login."
            });
        }

        const actualToken = token.split(" ")[1];

        const verified = jwt.verify(
            actualToken,
            process.env.JWT_SECRET
        );

        req.user = verified;

        next();

    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;