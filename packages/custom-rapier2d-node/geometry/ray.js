"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RayColliderToi = exports.RayColliderIntersection = exports.RayIntersection = exports.Ray = void 0;
const math_1 = require("../math");
const feature_1 = require("./feature");
/**
 * A ray. This is a directed half-line.
 */
class Ray {
    /**
     * Builds a ray from its origin and direction.
     *
     * @param origin - The ray's starting point.
     * @param dir - The ray's direction of propagation.
     */
    constructor(origin, dir) {
        this.origin = origin;
        this.dir = dir;
    }
    pointAt(t) {
        return {
            x: this.origin.x + this.dir.x * t,
            y: this.origin.y + this.dir.y * t,
        };
    }
}
exports.Ray = Ray;
/**
 * The intersection between a ray and a collider.
 */
class RayIntersection {
    constructor(toi, normal, featureType, featureId) {
        /**
         * The type of the geometric feature the point was projected on.
         */
        this.featureType = feature_1.FeatureType.Unknown;
        /**
         * The id of the geometric feature the point was projected on.
         */
        this.featureId = undefined;
        this.toi = toi;
        this.normal = normal;
        if (featureId !== undefined)
            this.featureId = featureId;
        if (featureType !== undefined)
            this.featureType = featureType;
    }
    static fromRaw(raw) {
        if (!raw)
            return null;
        const result = new RayIntersection(raw.toi(), math_1.VectorOps.fromRaw(raw.normal()), raw.featureType(), raw.featureId());
        raw.free();
        return result;
    }
}
exports.RayIntersection = RayIntersection;
/**
 * The intersection between a ray and a collider (includes the collider handle).
 */
class RayColliderIntersection {
    constructor(collider, toi, normal, featureType, featureId) {
        /**
         * The type of the geometric feature the point was projected on.
         */
        this.featureType = feature_1.FeatureType.Unknown;
        /**
         * The id of the geometric feature the point was projected on.
         */
        this.featureId = undefined;
        this.collider = collider;
        this.toi = toi;
        this.normal = normal;
        if (featureId !== undefined)
            this.featureId = featureId;
        if (featureType !== undefined)
            this.featureType = featureType;
    }
    static fromRaw(colliderSet, raw) {
        if (!raw)
            return null;
        const result = new RayColliderIntersection(colliderSet.get(raw.colliderHandle()), raw.toi(), math_1.VectorOps.fromRaw(raw.normal()), raw.featureType(), raw.featureId());
        raw.free();
        return result;
    }
}
exports.RayColliderIntersection = RayColliderIntersection;
/**
 * The time of impact between a ray and a collider.
 */
class RayColliderToi {
    constructor(collider, toi) {
        this.collider = collider;
        this.toi = toi;
    }
    static fromRaw(colliderSet, raw) {
        if (!raw)
            return null;
        const result = new RayColliderToi(colliderSet.get(raw.colliderHandle()), raw.toi());
        raw.free();
        return result;
    }
}
exports.RayColliderToi = RayColliderToi;
//# sourceMappingURL=ray.js.map