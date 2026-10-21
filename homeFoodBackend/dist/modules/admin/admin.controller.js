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
exports.updateOrderStatus = exports.listOrders = exports.deleteFood = exports.updateFood = exports.listFoods = exports.verifyShop = exports.listShops = exports.updateUserRole = exports.listUsers = exports.getStats = void 0;
const zod_1 = require("zod");
const adminService = __importStar(require("./admin.service"));
const admin_validation_1 = require("./admin.validation");
const handleError = (res, error) => {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.issues,
        });
    }
    const err = error;
    return res.status(err.status ?? 500).json({
        success: false,
        message: err.message ?? "Internal server error",
    });
};
const respond = async (res, action, status = 200) => {
    try {
        const data = await action();
        return res.status(status).json({ success: true, data });
    }
    catch (error) {
        return handleError(res, error);
    }
};
const getStats = (_req, res) => respond(res, adminService.getStats);
exports.getStats = getStats;
const listUsers = (req, res) => respond(res, () => {
    const { role } = admin_validation_1.userListQuerySchema.parse(req.query);
    return adminService.listUsers(role);
});
exports.listUsers = listUsers;
const updateUserRole = (req, res) => respond(res, () => {
    const { role } = admin_validation_1.updateUserRoleSchema.parse(req.body);
    return adminService.changeUserRole(req.params.id, role);
});
exports.updateUserRole = updateUserRole;
const listShops = (_req, res) => respond(res, adminService.listShops);
exports.listShops = listShops;
const verifyShop = (req, res) => respond(res, () => {
    const { verified } = admin_validation_1.verifyShopSchema.parse(req.body);
    return adminService.verifyShop(req.params.id, verified);
});
exports.verifyShop = verifyShop;
const listFoods = (req, res) => respond(res, () => {
    const { sellerId } = admin_validation_1.foodListQuerySchema.parse(req.query);
    return adminService.listFoods(sellerId);
});
exports.listFoods = listFoods;
const updateFood = (req, res) => respond(res, () => {
    admin_validation_1.updateFoodSchema.parse(req.body);
    return adminService.editFood(req.params.id, req.body);
});
exports.updateFood = updateFood;
const deleteFood = (req, res) => respond(res, () => adminService.removeFood(req.params.id));
exports.deleteFood = deleteFood;
const listOrders = (req, res) => respond(res, () => {
    const { status } = admin_validation_1.orderListQuerySchema.parse(req.query);
    return adminService.listOrders(status);
});
exports.listOrders = listOrders;
const updateOrderStatus = (req, res) => respond(res, () => {
    const { status } = admin_validation_1.updateOrderStatusSchema.parse(req.body);
    return adminService.changeOrderStatus(req.params.id, status);
});
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=admin.controller.js.map