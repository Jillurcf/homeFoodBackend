"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
        return res
            .status(403)
            .json({ success: false, message: "Insufficient permissions" });
    }
    next();
};
exports.requireRole = requireRole;
//# sourceMappingURL=requireRole.js.map