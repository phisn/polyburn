"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotationOps = exports.VectorOps = exports.Vector2 = void 0;
const raw_1 = require("./raw");
/**
 * A 2D vector.
 */
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Vector2 = Vector2;
class VectorOps {
    static new(x, y) {
        return new Vector2(x, y);
    }
    static zeros() {
        return VectorOps.new(0.0, 0.0);
    }
    // FIXME: type ram: RawVector?
    static fromRaw(raw) {
        if (!raw)
            return null;
        let res = VectorOps.new(raw.x, raw.y);
        raw.free();
        return res;
    }
    static intoRaw(v) {
        return new raw_1.RawVector(v.x, v.y);
    }
    static copy(out, input) {
        out.x = input.x;
        out.y = input.y;
    }
}
exports.VectorOps = VectorOps;
class RotationOps {
    static identity() {
        return 0.0;
    }
    static fromRaw(raw) {
        if (!raw)
            return null;
        let res = raw.angle;
        raw.free();
        return res;
    }
    static intoRaw(angle) {
        return raw_1.RawRotation.fromAngle(angle);
    }
}
exports.RotationOps = RotationOps;
// #endif
//# sourceMappingURL=math.js.map