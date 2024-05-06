"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KinematicCharacterController = exports.CharacterCollision = void 0;
const raw_1 = require("../raw");
const math_1 = require("../math");
/**
 * A collision between the character and an obstacle hit on its path.
 */
class CharacterCollision {
}
exports.CharacterCollision = CharacterCollision;
/**
 * A character controller for controlling kinematic bodies and parentless colliders by hitting
 * and sliding against obstacles.
 */
class KinematicCharacterController {
    constructor(offset, params, bodies, colliders, queries) {
        this.params = params;
        this.bodies = bodies;
        this.colliders = colliders;
        this.queries = queries;
        this.raw = new raw_1.RawKinematicCharacterController(offset);
        this.rawCharacterCollision = new raw_1.RawCharacterCollision();
        this._applyImpulsesToDynamicBodies = false;
        this._characterMass = null;
    }
    /** @internal */
    free() {
        if (!!this.raw) {
            this.raw.free();
            this.rawCharacterCollision.free();
        }
        this.raw = undefined;
        this.rawCharacterCollision = undefined;
    }
    /**
     * The direction that goes "up". Used to determine where the floor is, and the floor’s angle.
     */
    up() {
        return this.raw.up();
    }
    /**
     * Sets the direction that goes "up". Used to determine where the floor is, and the floor’s angle.
     */
    setUp(vector) {
        let rawVect = math_1.VectorOps.intoRaw(vector);
        return this.raw.setUp(rawVect);
        rawVect.free();
    }
    applyImpulsesToDynamicBodies() {
        return this._applyImpulsesToDynamicBodies;
    }
    setApplyImpulsesToDynamicBodies(enabled) {
        this._applyImpulsesToDynamicBodies = enabled;
    }
    /**
     * Returns the custom value of the character mass, if it was set by `this.setCharacterMass`.
     */
    characterMass() {
        return this._characterMass;
    }
    /**
     * Set the mass of the character to be used for impulse resolution if `self.applyImpulsesToDynamicBodies`
     * is set to `true`.
     *
     * If no character mass is set explicitly (or if it is set to `null`) it is automatically assumed to be equal
     * to the mass of the rigid-body the character collider is attached to; or equal to 0 if the character collider
     * isn’t attached to any rigid-body.
     *
     * @param mass - The mass to set.
     */
    setCharacterMass(mass) {
        this._characterMass = mass;
    }
    /**
     * A small gap to preserve between the character and its surroundings.
     *
     * This value should not be too large to avoid visual artifacts, but shouldn’t be too small
     * (must not be zero) to improve numerical stability of the character controller.
     */
    offset() {
        return this.raw.offset();
    }
    /**
     * Sets a small gap to preserve between the character and its surroundings.
     *
     * This value should not be too large to avoid visual artifacts, but shouldn’t be too small
     * (must not be zero) to improve numerical stability of the character controller.
     */
    setOffset(value) {
        this.raw.setOffset(value);
    }
    /**
     * Is sliding against obstacles enabled?
     */
    slideEnabled() {
        return this.raw.slideEnabled();
    }
    /**
     * Enable or disable sliding against obstacles.
     */
    setSlideEnabled(enabled) {
        this.raw.setSlideEnabled(enabled);
    }
    /**
     * The maximum step height a character can automatically step over.
     */
    autostepMaxHeight() {
        return this.raw.autostepMaxHeight();
    }
    /**
     * The minimum width of free space that must be available after stepping on a stair.
     */
    autostepMinWidth() {
        return this.raw.autostepMinWidth();
    }
    /**
     * Can the character automatically step over dynamic bodies too?
     */
    autostepIncludesDynamicBodies() {
        return this.raw.autostepIncludesDynamicBodies();
    }
    /**
     * Is automatically stepping over small objects enabled?
     */
    autostepEnabled() {
        return this.raw.autostepEnabled();
    }
    /**
     * Enabled automatically stepping over small objects.
     *
     * @param maxHeight - The maximum step height a character can automatically step over.
     * @param minWidth - The minimum width of free space that must be available after stepping on a stair.
     * @param includeDynamicBodies - Can the character automatically step over dynamic bodies too?
     */
    enableAutostep(maxHeight, minWidth, includeDynamicBodies) {
        this.raw.enableAutostep(maxHeight, minWidth, includeDynamicBodies);
    }
    /**
     * Disable automatically stepping over small objects.
     */
    disableAutostep() {
        return this.raw.disableAutostep();
    }
    /**
     * The maximum angle (radians) between the floor’s normal and the `up` vector that the
     * character is able to climb.
     */
    maxSlopeClimbAngle() {
        return this.raw.maxSlopeClimbAngle();
    }
    /**
     * Sets the maximum angle (radians) between the floor’s normal and the `up` vector that the
     * character is able to climb.
     */
    setMaxSlopeClimbAngle(angle) {
        this.raw.setMaxSlopeClimbAngle(angle);
    }
    /**
     * The minimum angle (radians) between the floor’s normal and the `up` vector before the
     * character starts to slide down automatically.
     */
    minSlopeSlideAngle() {
        return this.raw.minSlopeSlideAngle();
    }
    /**
     * Sets the minimum angle (radians) between the floor’s normal and the `up` vector before the
     * character starts to slide down automatically.
     */
    setMinSlopeSlideAngle(angle) {
        this.raw.setMinSlopeSlideAngle(angle);
    }
    /**
     * If snap-to-ground is enabled, should the character be automatically snapped to the ground if
     * the distance between the ground and its feet are smaller than the specified threshold?
     */
    snapToGroundDistance() {
        return this.raw.snapToGroundDistance();
    }
    /**
     * Enables automatically snapping the character to the ground if the distance between
     * the ground and its feet are smaller than the specified threshold.
     */
    enableSnapToGround(distance) {
        this.raw.enableSnapToGround(distance);
    }
    /**
     * Disables automatically snapping the character to the ground.
     */
    disableSnapToGround() {
        this.raw.disableSnapToGround();
    }
    /**
     * Is automatically snapping the character to the ground enabled?
     */
    snapToGroundEnabled() {
        return this.raw.snapToGroundEnabled();
    }
    /**
     * Computes the movement the given collider is able to execute after hitting and sliding on obstacles.
     *
     * @param collider - The collider to move.
     * @param desiredTranslation - The desired collider movement.
     * @param filterFlags - Flags for excluding whole subsets of colliders from the obstacles taken into account.
     * @param filterGroups - Groups for excluding colliders with incompatible collision groups from the obstacles
     *                       taken into account.
     * @param filterPredicate - Any collider for which this closure returns `false` will be excluded from the
     *                          obstacles taken into account.
     */
    computeColliderMovement(collider, desiredTranslation, filterFlags, filterGroups, filterPredicate) {
        let rawTranslation = math_1.VectorOps.intoRaw(desiredTranslation);
        this.raw.computeColliderMovement(this.params.dt, this.bodies.raw, this.colliders.raw, this.queries.raw, collider.handle, rawTranslation, this._applyImpulsesToDynamicBodies, this._characterMass, filterFlags, filterGroups, this.colliders.castClosure(filterPredicate));
        rawTranslation.free();
    }
    /**
     * The movement computed by the last call to `this.computeColliderMovement`.
     */
    computedMovement() {
        return math_1.VectorOps.fromRaw(this.raw.computedMovement());
    }
    /**
     * The result of ground detection computed by the last call to `this.computeColliderMovement`.
     */
    computedGrounded() {
        return this.raw.computedGrounded();
    }
    /**
     * The number of collisions against obstacles detected along the path of the last call
     * to `this.computeColliderMovement`.
     */
    numComputedCollisions() {
        return this.raw.numComputedCollisions();
    }
    /**
     * Returns the collision against one of the obstacles detected along the path of the last
     * call to `this.computeColliderMovement`.
     *
     * @param i - The i-th collision will be returned.
     * @param out - If this argument is set, it will be filled with the collision information.
     */
    computedCollision(i, out) {
        if (!this.raw.computedCollision(i, this.rawCharacterCollision)) {
            return null;
        }
        else {
            let c = this.rawCharacterCollision;
            out = out !== null && out !== void 0 ? out : new CharacterCollision();
            out.translationApplied = math_1.VectorOps.fromRaw(c.translationApplied());
            out.translationRemaining = math_1.VectorOps.fromRaw(c.translationRemaining());
            out.toi = c.toi();
            out.witness1 = math_1.VectorOps.fromRaw(c.worldWitness1());
            out.witness2 = math_1.VectorOps.fromRaw(c.worldWitness2());
            out.normal1 = math_1.VectorOps.fromRaw(c.worldNormal1());
            out.normal2 = math_1.VectorOps.fromRaw(c.worldNormal2());
            out.collider = this.colliders.get(c.handle());
            return out;
        }
    }
}
exports.KinematicCharacterController = KinematicCharacterController;
//# sourceMappingURL=character_controller.js.map