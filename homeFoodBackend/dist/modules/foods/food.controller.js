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
exports.deleteFood = exports.updateFood = exports.createFood = exports.getFoodById = exports.getMyFoods = exports.getCategories = exports.listFoods = void 0;
const zod_1 = require("zod");
const foodService = __importStar(require("./food.service"));
const food_validation_1 = require("./food.validation");
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
const listFoods = async (req, res) => {
    try {
        const query = food_validation_1.listFoodsQuerySchema.parse(req.query);
        const { foods, total } = await foodService.listFoods(query);
        const totalPages = Math.ceil(total / query.limit);
        return res.json({
            success: true,
            data: {
                foods,
                total,
                page: query.page,
                limit: query.limit,
                totalPages,
            },
        });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.listFoods = listFoods;
const getCategories = async (req, res) => {
    try {
        const categories = await foodService.getCategories();
        return res.json({ success: true, data: categories });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.getCategories = getCategories;
const getMyFoods = async (req, res) => {
    try {
        const foods = await foodService.getSellerFoods(req.user.id);
        return res.json({ success: true, data: foods });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.getMyFoods = getMyFoods;
const getFoodById = async (req, res) => {
    try {
        const food = await foodService.getFoodById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }
        return res.json({ success: true, data: food });
    }
    catch (err) {
        if (err.name === "CastError") {
            return res.status(404).json({ success: false, message: "Food not found" });
        }
        return handleError(res, err);
    }
};
exports.getFoodById = getFoodById;
const createFood = async (req, res) => {
    try {
        const payload = food_validation_1.createFoodSchema.parse(req.body);
        const food = await foodService.createFood(req.user.id, payload);
        return res.status(201).json({ success: true, data: food });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.createFood = createFood;
const updateFood = async (req, res) => {
    try {
        const payload = food_validation_1.updateFoodSchema.parse(req.body);
        const food = await foodService.updateFood(req.params.id, req.user.id, req.user.role, payload);
        return res.json({ success: true, data: food });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.updateFood = updateFood;
const deleteFood = async (req, res) => {
    try {
        const food = await foodService.deleteFood(req.params.id, req.user.id, req.user.role);
        return res.json({ success: true, data: food });
    }
    catch (err) {
        return handleError(res, err);
    }
};
exports.deleteFood = deleteFood;
//# sourceMappingURL=food.controller.js.map