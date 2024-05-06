"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointColliderProjection = exports.PointProjection = void 0;
const math_1 = require("../math");
const feature_1 = require("./feature");
/**
 * The projection of a point on a collider.
 */
class PointProjection {
    constructor(point, isInside) {
        this.point = point;
        this.isInside = isInside;
    }
    static fromRaw(raw) {
        if (!raw)
            return null;
        const result = new PointProjection(math_1.VectorOps.fromRaw(raw.point()), raw.isInside());
        raw.free();
        return result;
    }
}
exports.PointProjection = PointProjection;
/**
 * The projection of a point on a collider (includes the collider handle).
 */
class PointColliderProjection {
    constructor(collider, point, isInside, featureType, featureId) {
        /**
         * The type of the geometric feature the point was projected on.
         */
        this.featureType = feature_1.FeatureType.Unknown;
        /**
         * The id of the geometric feature the point was projected on.
         */
        this.featureId = undefined;
        this.collider = collider;
        this.point = point;
        this.isInside = isInside;
        if (featureId !== undefined)
            this.featureId = featureId;
        if (featureType !== undefined)
            this.featureType = featureType;
    }
    static fromRaw(colliderSet, raw) {
        if (!raw)
            return null;
        const result = new PointColliderProjection(colliderSet.get(raw.colliderHandle()), math_1.VectorOps.fromRaw(raw.point()), raw.isInside(), raw.featureType(), raw.featureId());
        raw.free();
        return result;
    }
}
exports.PointColliderProjection = PointColliderProjection;
//# sourceMappingURL=point.js.map