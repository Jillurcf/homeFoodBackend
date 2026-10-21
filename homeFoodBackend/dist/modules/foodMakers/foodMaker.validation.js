"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopSchema = exports.kitchenSchema = exports.aboutYouSchema = exports.KITCHEN_TYPES = void 0;
const zod_1 = require("zod");
exports.KITCHEN_TYPES = ["home", "shared", "home_catering"];
/** Step 1 — About you */
exports.aboutYouSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Please enter your full name."),
    phone: zod_1.z.string().trim().min(6, "Please enter a valid phone number."),
    email: zod_1.z.string().trim().email("Please enter a valid email address."),
    area: zod_1.z.string().trim().min(1, "Please choose the area your kitchen is in."),
    photoUrl: zod_1.z.string().trim().optional(),
    bio: zod_1.z.string().trim().optional(),
});
/** Step 2 — Your kitchen */
exports.kitchenSchema = zod_1.z.object({
    shopName: zod_1.z.string().trim().min(2, "Please give your kitchen a name."),
    kitchenType: zod_1.z.enum(exports.KITCHEN_TYPES),
    address: zod_1.z.string().trim().min(3, "Please enter your kitchen address."),
    areas: zod_1.z
        .array(zod_1.z.string().trim().min(1))
        .min(1, "Please select at least one delivery area."),
    openHours: zod_1.z.string().trim().optional(),
});
/** Full payload submitted on step 3 — Review & go live */
exports.shopSchema = exports.aboutYouSchema.merge(exports.kitchenSchema).extend({
    nidNumber: zod_1.z.string().trim().optional(),
});
//# sourceMappingURL=foodMaker.validation.js.map