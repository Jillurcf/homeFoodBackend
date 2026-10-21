"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.id !== "string" ||
            decoded.id.length === 0 ||
            typeof decoded.role !== "string" ||
            !["buyer", "seller", "admin"].includes(decoded.role)) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid or expired token" });
        }
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map