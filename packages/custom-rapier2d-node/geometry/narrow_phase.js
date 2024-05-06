"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempContactManifold = exports.NarrowPhase = void 0;
const raw_1 = require("../raw");
const math_1 = require("../math");
/**
 * The narrow-phase used for precise collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `narrowPhase.free()`
 * once you are done using it.
 */
class NarrowPhase {
    /**
     * Release the WASM memory occupied by this narrow-phase.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    constructor(raw) {
        this.raw = raw || new raw_1.RawNarrowPhase();
        this.tempManifold = new TempContactManifold(null);
    }
    /**
     * Enumerates all the colliders potentially in contact with the given collider.
     *
     * @param collider1 - The second collider involved in the contact.
     * @param f - Closure that will be called on each collider that is in contact with `collider1`.
     */
    contactsWith(collider1, f) {
        this.raw.contacts_with(collider1, f);
    }
    /**
     * Enumerates all the colliders intersecting the given colliders, assuming one of them
     * is a sensor.
     */
    intersectionsWith(collider1, f) {
        this.raw.intersections_with(collider1, f);
    }
    /**
     * Iterates through all the contact manifolds between the given pair of colliders.
     *
     * @param collider1 - The first collider involved in the contact.
     * @param collider2 - The second collider involved in the contact.
     * @param f - Closure that will be called on each contact manifold between the two colliders. If the second argument
     *            passed to this closure is `true`, then the contact manifold data is flipped, i.e., methods like `localNormal1`
     *            actually apply to the `collider2` and fields like `localNormal2` apply to the `collider1`.
     */
    contactPair(collider1, collider2, f) {
        const rawPair = this.raw.contact_pair(collider1, collider2);
        if (!!rawPair) {
            const flipped = rawPair.collider1() != collider1;
            let i;
            for (i = 0; i < rawPair.numContactManifolds(); ++i) {
                this.tempManifold.raw = rawPair.contactManifold(i);
                if (!!this.tempManifold.raw) {
                    f(this.tempManifold, flipped);
                }
                // SAFETY: The RawContactManifold stores a raw pointer that will be invalidated
                //         at the next timestep. So we must be sure to free the pair here
                //         to avoid unsoundness in the Rust code.
                this.tempManifold.free();
            }
            rawPair.free();
        }
    }
    /**
     * Returns `true` if `collider1` and `collider2` intersect and at least one of them is a sensor.
     * @param collider1 − The first collider involved in the intersection.
     * @param collider2 − The second collider involved in the intersection.
     */
    intersectionPair(collider1, collider2) {
        return this.raw.intersection_pair(collider1, collider2);
    }
}
exports.NarrowPhase = NarrowPhase;
class TempContactManifold {
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    constructor(raw) {
        this.raw = raw;
    }
    normal() {
        return math_1.VectorOps.fromRaw(this.raw.normal());
    }
    localNormal1() {
        return math_1.VectorOps.fromRaw(this.raw.local_n1());
    }
    localNormal2() {
        return math_1.VectorOps.fromRaw(this.raw.local_n2());
    }
    subshape1() {
        return this.raw.subshape1();
    }
    subshape2() {
        return this.raw.subshape2();
    }
    numContacts() {
        return this.raw.num_contacts();
    }
    localContactPoint1(i) {
        return math_1.VectorOps.fromRaw(this.raw.contact_local_p1(i));
    }
    localContactPoint2(i) {
        return math_1.VectorOps.fromRaw(this.raw.contact_local_p2(i));
    }
    contactDist(i) {
        return this.raw.contact_dist(i);
    }
    contactFid1(i) {
        return this.raw.contact_fid1(i);
    }
    contactFid2(i) {
        return this.raw.contact_fid2(i);
    }
    contactImpulse(i) {
        return this.raw.contact_impulse(i);
    }
    // #if DIM2
    contactTangentImpulse(i) {
        return this.raw.contact_tangent_impulse(i);
    }
    // #endif
    numSolverContacts() {
        return this.raw.num_solver_contacts();
    }
    solverContactPoint(i) {
        return math_1.VectorOps.fromRaw(this.raw.solver_contact_point(i));
    }
    solverContactDist(i) {
        return this.raw.solver_contact_dist(i);
    }
    solverContactFriction(i) {
        return this.raw.solver_contact_friction(i);
    }
    solverContactRestitution(i) {
        return this.raw.solver_contact_restitution(i);
    }
    solverContactTangentVelocity(i) {
        return math_1.VectorOps.fromRaw(this.raw.solver_contact_tangent_velocity(i));
    }
}
exports.TempContactManifold = TempContactManifold;
//# sourceMappingURL=narrow_phase.js.map