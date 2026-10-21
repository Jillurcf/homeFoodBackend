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
exports.replyToReview = exports.createReview = exports.listSellerReviews = exports.listReviews = void 0;
const zod_1 = require("zod");
const reviewService = __importStar(require("./review.service"));
const review_validation_1 = require("./review.validation");
const handleError = (res, err) => {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: err.issues,
        });
    }
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
};
const listReviews = async (req, res) => {
    try {
        const query = review_validation_1.listReviewsQuerySchema.parse(req.query);
        const { reviews, total } = await reviewService.listReviews(query);
        return res.json({
            success: true,
            data: { reviews, total },
        });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.listReviews = listReviews;
const listSellerReviews = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const reviews = await reviewService.listSellerReviews(sellerId);
        return res.json({ success: true, data: reviews });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.listSellerReviews = listSellerReviews;
const createReview = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const input = review_validation_1.createReviewSchema.parse(req.body);
        const review = await reviewService.createReview(buyerId, input);
        return res.status(201).json({ success: true, data: review });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.createReview = createReview;
const replyToReview = async (req, res) => {
    try {
        const user = req.user;
        const { reply } = review_validation_1.replyReviewSchema.parse(req.body);
        const updated = await reviewService.replyToReview(req.params.id, user.id, user.role, reply);
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.replyToReview = replyToReview;
//# sourceMappingURL=review.controller.js.map