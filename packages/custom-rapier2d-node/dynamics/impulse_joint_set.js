"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImpulseJointSet = void 0;
const raw_1 = require("../raw");
const coarena_1 = require("../coarena");
const impulse_joint_1 = require("./impulse_joint");
/**
 * A set of joints.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `jointSet.free()`
 * once you are done using it (and all the joints it created).
 */
class ImpulseJointSet {
    /**
     * Release the WASM memory occupied by this joint set.
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
        this.raw = raw || new raw_1.RawImpulseJointSet();
        this.map = new coarena_1.Coarena();
        // Initialize the map with the existing elements, if any.
        if (raw) {
            raw.forEachJointHandle((handle) => {
                this.map.set(handle, impulse_joint_1.ImpulseJoint.newTyped(raw, null, handle));
            });
        }
    }
    /** @internal */
    finalizeDeserialization(bodies) {
        this.map.forEach((joint) => joint.finalizeDeserialization(bodies));
    }
    /**
     * Creates a new joint and return its integer handle.
     *
     * @param bodies - The set of rigid-bodies containing the bodies the joint is attached to.
     * @param desc - The joint's parameters.
     * @param parent1 - The handle of the first rigid-body this joint is attached to.
     * @param parent2 - The handle of the second rigid-body this joint is attached to.
     * @param wakeUp - Should the attached rigid-bodies be awakened?
     */
    createJoint(bodies, desc, parent1, parent2, wakeUp) {
        const rawParams = desc.intoRaw();
        const handle = this.raw.createJoint(rawParams, parent1, parent2, wakeUp);
        rawParams.free();
        let joint = impulse_joint_1.ImpulseJoint.newTyped(this.raw, bodies, handle);
        this.map.set(handle, joint);
        return joint;
    }
    /**
     * Remove a joint from this set.
     *
     * @param handle - The integer handle of the joint.
     * @param wakeUp - If `true`, the rigid-bodies attached by the removed joint will be woken-up automatically.
     */
    remove(handle, wakeUp) {
        this.raw.remove(handle, wakeUp);
        this.unmap(handle);
    }
    /**
     * Calls the given closure with the integer handle of each impulse joint attached to this rigid-body.
     *
     * @param f - The closure called with the integer handle of each impulse joint attached to the rigid-body.
     */
    forEachJointHandleAttachedToRigidBody(handle, f) {
        this.raw.forEachJointAttachedToRigidBody(handle, f);
    }
    /**
     * Internal function, do not call directly.
     * @param handle
     */
    unmap(handle) {
        this.map.delete(handle);
    }
    /**
     * The number of joints on this set.
     */
    len() {
        return this.map.len();
    }
    /**
     * Does this set contain a joint with the given handle?
     *
     * @param handle - The joint handle to check.
     */
    contains(handle) {
        return this.get(handle) != null;
    }
    /**
     * Gets the joint with the given handle.
     *
     * Returns `null` if no joint with the specified handle exists.
     *
     * @param handle - The integer handle of the joint to retrieve.
     */
    get(handle) {
        return this.map.get(handle);
    }
    /**
     * Applies the given closure to each joint contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEach(f) {
        this.map.forEach(f);
    }
    /**
     * Gets all joints in the list.
     *
     * @returns joint list.
     */
    getAll() {
        return this.map.getAll();
    }
}
exports.ImpulseJointSet = ImpulseJointSet;
//# sourceMappingURL=impulse_joint_set.js.map