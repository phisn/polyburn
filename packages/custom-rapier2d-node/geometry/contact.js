"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapeContact = void 0;
const math_1 = require("../math");
/**
 * The contact info between two shapes.
 */
class ShapeContact {
    constructor(dist, point1, point2, normal1, normal2) {
        this.distance = dist;
        this.point1 = point1;
        this.point2 = point2;
        this.normal1 = normal1;
        this.normal2 = normal2;
    }
    static fromRaw(raw) {
        if (!raw)
            return null;
        const result = new ShapeContact(raw.distance(), math_1.VectorOps.fromRaw(raw.point1()), math_1.VectorOps.fromRaw(raw.point2()), math_1.VectorOps.fromRaw(raw.normal1()), math_1.VectorOps.fromRaw(raw.normal2()));
        raw.free();
        return result;
    }
}
exports.ShapeContact = ShapeContact;
//# sourceMappingURL=contact.js.map