"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPipeline = exports.QueryFilterFlags = void 0;
const raw_1 = require("../raw");
const geometry_1 = require("../geometry");
const math_1 = require("../math");
// NOTE: must match the bits in the QueryFilterFlags on the Rust side.
/**
 * Flags for excluding whole sets of colliders from a scene query.
 */
var QueryFilterFlags;
(function (QueryFilterFlags) {
    /**
     * Exclude from the query any collider attached to a fixed rigid-body and colliders with no rigid-body attached.
     */
    QueryFilterFlags[QueryFilterFlags["EXCLUDE_FIXED"] = 1] = "EXCLUDE_FIXED";
    /**
     * Exclude from the query any collider attached to a dynamic rigid-body.
     */
    QueryFilterFlags[QueryFilterFlags["EXCLUDE_KINEMATIC"] = 2] = "EXCLUDE_KINEMATIC";
    /**
     * Exclude from the query any collider attached to a kinematic rigid-body.
     */
    QueryFilterFlags[QueryFilterFlags["EXCLUDE_DYNAMIC"] = 4] = "EXCLUDE_DYNAMIC";
    /**
     * Exclude from the query any collider that is a sensor.
     */
    QueryFilterFlags[QueryFilterFlags["EXCLUDE_SENSORS"] = 8] = "EXCLUDE_SENSORS";
    /**
     * Exclude from the query any collider that is not a sensor.
     */
    QueryFilterFlags[QueryFilterFlags["EXCLUDE_SOLIDS"] = 16] = "EXCLUDE_SOLIDS";
    /**
     * Excludes all colliders not attached to a dynamic rigid-body.
     */
    QueryFilterFlags[QueryFilterFlags["ONLY_DYNAMIC"] = 3] = "ONLY_DYNAMIC";
    /**
     * Excludes all colliders not attached to a kinematic rigid-body.
     */
    QueryFilterFlags[QueryFilterFlags["ONLY_KINEMATIC"] = 5] = "ONLY_KINEMATIC";
    /**
     * Exclude all colliders attached to a non-fixed rigid-body
     * (this will not exclude colliders not attached to any rigid-body).
     */
    QueryFilterFlags[QueryFilterFlags["ONLY_FIXED"] = 6] = "ONLY_FIXED";
})(QueryFilterFlags = exports.QueryFilterFlags || (exports.QueryFilterFlags = {}));
/**
 * A pipeline for performing queries on all the colliders of a scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `queryPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
class QueryPipeline {
    /**
     * Release the WASM memory occupied by this query pipeline.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    constructor(raw) {
        this.raw = raw || new raw_1.RawQueryPipeline();
    }
    /**
     * Updates the acceleration structure of the query pipeline.
     * @param bodies - The set of rigid-bodies taking part in this pipeline.
     * @param colliders - The set of colliders taking part in this pipeline.
     */
    update(bodies, colliders) {
        this.raw.update(bodies.raw, colliders.raw);
    }
    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param filter - The callback to filter out which collider will be hit.
     */
    castRay(bodies, colliders, ray, maxToi, solid, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawDir = math_1.VectorOps.intoRaw(ray.dir);
        let result = geometry_1.RayColliderToi.fromRaw(colliders, this.raw.castRay(bodies.raw, colliders.raw, rawOrig, rawDir, maxToi, solid, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate));
        rawOrig.free();
        rawDir.free();
        return result;
    }
    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * This also computes the normal at the hit point.
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     */
    castRayAndGetNormal(bodies, colliders, ray, maxToi, solid, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawDir = math_1.VectorOps.intoRaw(ray.dir);
        let result = geometry_1.RayColliderIntersection.fromRaw(colliders, this.raw.castRayAndGetNormal(bodies.raw, colliders.raw, rawOrig, rawDir, maxToi, solid, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate));
        rawOrig.free();
        rawDir.free();
        return result;
    }
    /**
     * Cast a ray and collects all the intersections between a ray and the scene.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param callback - The callback called once per hit (in no particular order) between a ray and a collider.
     *   If this callback returns `false`, then the cast will stop and no further hits will be detected/reported.
     */
    intersectionsWithRay(bodies, colliders, ray, maxToi, solid, callback, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawDir = math_1.VectorOps.intoRaw(ray.dir);
        let rawCallback = (rawInter) => {
            return callback(geometry_1.RayColliderIntersection.fromRaw(colliders, rawInter));
        };
        this.raw.intersectionsWithRay(bodies.raw, colliders.raw, rawOrig, rawDir, maxToi, solid, rawCallback, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate);
        rawOrig.free();
        rawDir.free();
    }
    /**
     * Gets the handle of up to one collider intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape used for the intersection test.
     * @param shapeRot - The orientation of the shape used for the intersection test.
     * @param shape - The shape used for the intersection test.
     * @param groups - The bit groups and filter associated to the ray, in order to only
     *   hit the colliders with collision groups compatible with the ray's group.
     */
    intersectionWithShape(bodies, colliders, shapePos, shapeRot, shape, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawShape = shape.intoRaw();
        let result = this.raw.intersectionWithShape(bodies.raw, colliders.raw, rawPos, rawRot, rawShape, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate);
        rawPos.free();
        rawRot.free();
        rawShape.free();
        return result;
    }
    /**
     * Find the projection of a point on the closest collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point to project.
     * @param solid - If this is set to `true` then the collider shapes are considered to
     *   be plain (if the point is located inside of a plain shape, its projection is the point
     *   itself). If it is set to `false` the collider shapes are considered to be hollow
     *   (if the point is located inside of an hollow shape, it is projected on the shape's
     *   boundary).
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    projectPoint(bodies, colliders, point, solid, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawPoint = math_1.VectorOps.intoRaw(point);
        let result = geometry_1.PointColliderProjection.fromRaw(colliders, this.raw.projectPoint(bodies.raw, colliders.raw, rawPoint, solid, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate));
        rawPoint.free();
        return result;
    }
    /**
     * Find the projection of a point on the closest collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point to project.
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    projectPointAndGetFeature(bodies, colliders, point, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawPoint = math_1.VectorOps.intoRaw(point);
        let result = geometry_1.PointColliderProjection.fromRaw(colliders, this.raw.projectPointAndGetFeature(bodies.raw, colliders.raw, rawPoint, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate));
        rawPoint.free();
        return result;
    }
    /**
     * Find all the colliders containing the given point.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point used for the containment test.
     * @param groups - The bit groups and filter associated to the point to test, in order to only
     *   test on colliders with collision groups compatible with the ray's group.
     * @param callback - A function called with the handles of each collider with a shape
     *   containing the `point`.
     */
    intersectionsWithPoint(bodies, colliders, point, callback, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawPoint = math_1.VectorOps.intoRaw(point);
        this.raw.intersectionsWithPoint(bodies.raw, colliders.raw, rawPoint, callback, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate);
        rawPoint.free();
    }
    /**
     * Casts a shape at a constant linear velocity and retrieve the first collider it hits.
     * This is similar to ray-casting except that we are casting a whole shape instead of
     * just a point (the ray origin).
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The initial position of the shape to cast.
     * @param shapeRot - The initial rotation of the shape to cast.
     * @param shapeVel - The constant velocity of the shape to cast (i.e. the cast direction).
     * @param shape - The shape to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the distance traveled by the shape to `shapeVel.norm() * maxToi`.
     * @param stopAtPenetration - If set to `false`, the linear shape-cast won’t immediately stop if
     *   the shape is penetrating another shape at its starting point **and** its trajectory is such
     *   that it’s on a path to exist that penetration state.
     * @param groups - The bit groups and filter associated to the shape to cast, in order to only
     *   test on colliders with collision groups compatible with this group.
     */
    castShape(bodies, colliders, shapePos, shapeRot, shapeVel, shape, maxToi, stopAtPenetration, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawVel = math_1.VectorOps.intoRaw(shapeVel);
        let rawShape = shape.intoRaw();
        let result = geometry_1.ShapeColliderTOI.fromRaw(colliders, this.raw.castShape(bodies.raw, colliders.raw, rawPos, rawRot, rawVel, rawShape, maxToi, stopAtPenetration, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate));
        rawPos.free();
        rawRot.free();
        rawVel.free();
        rawShape.free();
        return result;
    }
    /**
     * Retrieve all the colliders intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape to test.
     * @param shapeRot - The orientation of the shape to test.
     * @param shape - The shape to test.
     * @param groups - The bit groups and filter associated to the shape to test, in order to only
     *   test on colliders with collision groups compatible with this group.
     * @param callback - A function called with the handles of each collider intersecting the `shape`.
     */
    intersectionsWithShape(bodies, colliders, shapePos, shapeRot, shape, callback, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawShape = shape.intoRaw();
        this.raw.intersectionsWithShape(bodies.raw, colliders.raw, rawPos, rawRot, rawShape, callback, filterFlags, filterGroups, filterExcludeCollider, filterExcludeRigidBody, filterPredicate);
        rawPos.free();
        rawRot.free();
        rawShape.free();
    }
    /**
     * Finds the handles of all the colliders with an AABB intersecting the given AABB.
     *
     * @param aabbCenter - The center of the AABB to test.
     * @param aabbHalfExtents - The half-extents of the AABB to test.
     * @param callback - The callback that will be called with the handles of all the colliders
     *                   currently intersecting the given AABB.
     */
    collidersWithAabbIntersectingAabb(aabbCenter, aabbHalfExtents, callback) {
        let rawCenter = math_1.VectorOps.intoRaw(aabbCenter);
        let rawHalfExtents = math_1.VectorOps.intoRaw(aabbHalfExtents);
        this.raw.collidersWithAabbIntersectingAabb(rawCenter, rawHalfExtents, callback);
        rawCenter.free();
        rawHalfExtents.free();
    }
}
exports.QueryPipeline = QueryPipeline;
//# sourceMappingURL=query_pipeline.js.map