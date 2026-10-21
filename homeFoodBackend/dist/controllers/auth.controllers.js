"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const user_service_1 = require("../modules/user/user.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await (0, user_service_1.getUserByEmail)(email);
        if (existing)
            return res.status(400).json({ error: "User already exists" });
        const user = await (0, user_service_1.createUser)(name, email, password);
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({ user, token });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.register = register;
exports.default = { register: exports.register };
//# sourceMappingURL=auth.controllers.js.map