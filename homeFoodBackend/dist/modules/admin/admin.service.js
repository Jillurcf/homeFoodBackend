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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOrderStatus = exports.listOrders = exports.removeFood = exports.editFood = exports.listFoods = exports.verifyShop = exports.listShops = exports.changeUserRole = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.listUsers = exports.getStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../../config/env");
const adminRepository = __importStar(require("./admin.repository"));
const admin_validation_1 = require("./admin.validation");
const orderService = __importStar(require("../orders/order.service"));
const assertValidId = (id) => {
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw Object.assign(new Error("Invalid ID"), { status: 400 });
    }
};
const conflict = (message) => Object.assign(new Error(message), { status: 409 });
const assertEmailAvailable = async (email, excludeId) => {
    const existing = await adminRepository.findUserByEmail(email);
    if (existing && existing._id.toString() !== excludeId) {
        throw conflict("Email already registered");
    }
};
const assertUsernameAvailable = async (username, excludeId) => {
    const existing = await adminRepository.findUserByUsername(username);
    if (existing && existing._id.toString() !== excludeId) {
        throw conflict("Username already taken");
    }
};
const getStats = () => adminRepository.getStats();
exports.getStats = getStats;
const listUsers = (role) => adminRepository.findUsers(role);
exports.listUsers = listUsers;
const getUser = async (id) => {
    assertValidId(id);
    const user = await adminRepository.findUserById(id);
    if (!user)
        throw Object.assign(new Error("User not found"), { status: 404 });
    return user;
};
exports.getUser = getUser;
const createUser = async (input) => {
    await assertEmailAvailable(input.email);
    await assertUsernameAvailable(input.username);
    const password = await bcrypt_1.default.hash(input.password, env_1.env.BCRYPT_SALT_ROUNDS);
    return adminRepository.createUser({
        name: input.name,
        username: input.username,
        email: input.email,
        password,
        phone: input.phone,
        address: input.address,
        role: input.role,
    });
};
exports.createUser = createUser;
const updateUser = async (id, fields) => {
    assertValidId(id);
    if (fields.email)
        await assertEmailAvailable(fields.email, id);
    if (fields.username)
        await assertUsernameAvailable(fields.username, id);
    const updates = { ...fields };
    if (fields.password) {
        updates.password = await bcrypt_1.default.hash(fields.password, env_1.env.BCRYPT_SALT_ROUNDS);
    }
    const user = await adminRepository.updateUser(id, updates);
    if (!user)
        throw Object.assign(new Error("User not found"), { status: 404 });
    return user;
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    assertValidId(id);
    const user = await adminRepository.deleteUser(id);
    if (!user)
        throw Object.assign(new Error("User not found"), { status: 404 });
    return user;
};
exports.deleteUser = deleteUser;
const changeUserRole = async (id, role) => {
    assertValidId(id);
    const user = await adminRepository.updateUserRole(id, role);
    if (!user)
        throw Object.assign(new Error("User not found"), { status: 404 });
    return user;
};
exports.changeUserRole = changeUserRole;
const listShops = () => adminRepository.findShops();
exports.listShops = listShops;
const verifyShop = async (id, verified) => {
    assertValidId(id);
    const shop = await adminRepository.setShopVerification(id, verified);
    if (!shop)
        throw Object.assign(new Error("Shop not found"), { status: 404 });
    if (shop.userId) {
        await adminRepository.setUserVerification(shop.userId, verified);
    }
    return shop;
};
exports.verifyShop = verifyShop;
const listFoods = (sellerId) => adminRepository.findFoods(sellerId);
exports.listFoods = listFoods;
const editFood = async (id, fields) => {
    assertValidId(id);
    const input = admin_validation_1.updateFoodSchema.parse(fields);
    const food = await adminRepository.updateFood(id, input);
    if (!food)
        throw Object.assign(new Error("Food not found"), { status: 404 });
    return food;
};
exports.editFood = editFood;
const removeFood = async (id) => {
    assertValidId(id);
    const food = await adminRepository.deleteFood(id);
    if (!food)
        throw Object.assign(new Error("Food not found"), { status: 404 });
    return food;
};
exports.removeFood = removeFood;
const listOrders = (status) => adminRepository.findOrders(status);
exports.listOrders = listOrders;
const changeOrderStatus = (id, status) => {
    assertValidId(id);
    return orderService.adminUpdateStatus(id, status);
};
exports.changeOrderStatus = changeOrderStatus;
//# sourceMappingURL=admin.service.js.map