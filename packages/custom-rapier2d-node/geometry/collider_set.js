"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColliderSet = void 0;
const raw_1 = require("../raw");
const coarena_1 = require("../coarena");
const math_1 = require("../math");
const collider_1 = require("./collider");
/**
 * A set of rigid bodies that can be handled by a physics pipeline.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `colliderSet.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
class ColliderSet {
    /**
     * Release the WASM memory occupied by this collider set.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
        if (!!this.map) {
            this.map.clear();
        }
        this.map = undefined;
    }
    constructor(raw) {
        this.raw = raw || new raw_1.RawColliderSet();
        this.map = new coarena_1.Coarena();
        // Initialize the map with the existing elements, if any.
        if (raw) {
            raw.forEachColliderHandle((handle) => {
                this.map.set(handle, new collider_1.Collider(this, handle, null));
            });
        }
    }
    /** @internal */
    castClosure(f) {
        return (handle) => {
            if (!!f) {
                return f(this.get(handle));
            }
            else {
                return undefined;
            }
        };
    }
    /** @internal */
    finalizeDeserialization(bodies) {
        this.map.forEach((collider) => collider.finalizeDeserialization(bodies));
    }
    /**
     * Creates a new collider and return its integer handle.
     *
     * @param bodies - The set of bodies where the collider's parent can be found.
     * @param desc - The collider's description.
     * @param parentHandle - The integer handle of the rigid-body this collider is attached to.
     */
    createCollider(bodies, desc, parentHandle) {
        let hasParent = parentHandle != undefined && parentHandle != null;
        if (hasParent && isNaN(parentHandle))
            throw Error("Cannot create a collider with a parent rigid-body handle that is not a number.");
        let rawShape = desc.shape.intoRaw();
        let rawTra = math_1.VectorOps.intoRaw(desc.translation);
        let rawRot = math_1.RotationOps.intoRaw(desc.rotation);
        let rawCom = math_1.VectorOps.intoRaw(desc.centerOfMass);
        let handle = this.raw.createCollider(desc.enabled, rawShape, rawTra, rawRot, desc.massPropsMode, desc.mass, rawCom, 
        // #if DIM2
        desc.principalAngularInertia, 
        // #endif
        desc.density, desc.friction, desc.restitution, desc.frictionCombineRule, desc.restitutionCombineRule, desc.isSensor, desc.collisionGroups, desc.solverGroups, desc.activeCollisionTypes, desc.activeHooks, desc.activeEvents, desc.contactForceEventThreshold, hasParent, hasParent ? parentHandle : 0, bodies.raw);
        rawShape.free();
        rawTra.free();
        rawRot.free();
        rawCom.free();
        let parent = hasParent ? bodies.get(parentHandle) : null;
        let collider = new collider_1.Collider(this, handle, parent, desc.shape);
        this.map.set(handle, collider);
        return collider;
    }
    /**
     * Remove a collider from this set.
     *
     * @param handle - The integer handle of the collider to remove.
     * @param bodies - The set of rigid-body containing the rigid-body the collider is attached to.
     * @param wakeUp - If `true`, the rigid-body the removed collider is attached to will be woken-up automatically.
     */
    remove(handle, islands, bodies, wakeUp) {
        this.raw.remove(handle, islands.raw, bodies.raw, wakeUp);
        this.unmap(handle);
    }
    /**
     * Internal function, do not call directly.
     * @param handle
     */
    unmap(handle) {
        this.map.delete(handle);
    }
    /**
     * Gets the rigid-body with the given handle.
     *
     * @param handle - The handle of the rigid-body to retrieve.
     */
    get(handle) {
        return this.map.get(handle);
    }
    /**
     * The number of colliders on this set.
     */
    len() {
        return this.map.len();
    }
    /**
     * Does this set contain a collider with the given handle?
     *
     * @param handle - The collider handle to check.
     */
    contains(handle) {
        return this.get(handle) != null;
    }
    /**
     * Applies the given closure to each collider contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEach(f) {
        this.map.forEach(f);
    }
    /**
     * Gets all colliders in the list.
     *
     * @returns collider list.
     */
    getAll() {
        return this.map.getAll();
    }
}
exports.ColliderSet = ColliderSet;
//# sourceMappingURL=collider_set.js.map