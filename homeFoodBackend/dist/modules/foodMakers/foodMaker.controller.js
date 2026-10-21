"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyStats = exports.getPublicShop = exports.upsertMe = exports.getMe = void 0;
const zod_1 = require("zod");
const foodMakerService = __importStar(require("./foodMaker.service"));
const foodMaker_validation_1 = require("./foodMaker.validation");
const handleError = (res, err) => {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: err.issues[0]?.message || "Validation error",
            errors: err.issues,
        });
    }
    if (err?.name === "CastError") {
        return res.status(404).json({ success: false, message: "Shop not found" });
    }
    return res.status(500).json({ success: false, message: err.message });
};
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        const shop = await foodMakerService.getMyShop(userId);
        if (!shop) {
            return res
                .status(404)
                .json({ success: false, message: "No shop profile found" });
        }
        return res.json({ success: true, data: shop });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.getMe = getMe;
const upsertMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        const input = foodMaker_validation_1.shopSchema.parse(req.body);
        const shop = await foodMakerService.saveMyShop(userId, input);
        return res.json({ success: true, data: shop });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.upsertMe = upsertMe;
const getPublicShop = async (req, res) => {
    try {
        const shop = await foodMakerService.getPublicShop(req.params.shopId);
        if (!shop) {
            return res
                .status(404)
                .json({ success: false, message: "Shop not found" });
        }
        return res.json({
            success: true,
            data: foodMakerService.toPublicShop(shop),
        });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.getPublicShop = getPublicShop;
const getMyStats = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const stats = await foodMakerService.getMyStats(sellerId);
        return res.json({
            success: true,
            data: stats,
        });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.getMyStats = getMyStats;
//# sourceMappingURL=foodMaker.controller.js.map