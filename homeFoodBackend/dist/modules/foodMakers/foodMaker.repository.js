"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateByUserId = exports.createShop = exports.findById = exports.findByUserId = void 0;
const foodMaker_model_1 = __importDefault(require("./foodMaker.model"));
const findByUserId = async (userId) => {
    return await foodMaker_model_1.default.findOne({ userId });
};
exports.findByUserId = findByUserId;
const findById = async (id) => {
    return await foodMaker_model_1.default.findById(id);
};
exports.findById = findById;
const createShop = async (userId, data) => {
    return await foodMaker_model_1.default.create({ ...data, userId });
};
exports.createShop = createShop;
const updateByUserId = async (userId, data) => {
    return await foodMaker_model_1.default.findOneAndUpdate({ userId }, { $set: data }, { new: true, runValidators: true });
};
exports.updateByUserId = updateByUserId;
//# sourceMappingURL=foodMaker.repository.js.map