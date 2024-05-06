"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RigidBodyDesc = exports.RigidBody = exports.RigidBodyType = void 0;
const math_1 = require("../math");
/**
 * The simulation status of a rigid-body.
 */
// TODO: rename this to RigidBodyType
var RigidBodyType;
(function (RigidBodyType) {
    /**
     * A `RigidBodyType::Dynamic` body can be affected by all external forces.
     */
    RigidBodyType[RigidBodyType["Dynamic"] = 0] = "Dynamic";
    /**
     * A `RigidBodyType::Fixed` body cannot be affected by external forces.
     */
    RigidBodyType[RigidBodyType["Fixed"] = 1] = "Fixed";
    /**
     * A `RigidBodyType::KinematicPositionBased` body cannot be affected by any external forces but can be controlled
     * by the user at the position level while keeping realistic one-way interaction with dynamic bodies.
     *
     * One-way interaction means that a kinematic body can push a dynamic body, but a kinematic body
     * cannot be pushed by anything. In other words, the trajectory of a kinematic body can only be
     * modified by the user and is independent from any contact or joint it is involved in.
     */
    RigidBodyType[RigidBodyType["KinematicPositionBased"] = 2] = "KinematicPositionBased";
    /**
     * A `RigidBodyType::KinematicVelocityBased` body cannot be affected by any external forces but can be controlled
     * by the user at the velocity level while keeping realistic one-way interaction with dynamic bodies.
     *
     * One-way interaction means that a kinematic body can push a dynamic body, but a kinematic body
     * cannot be pushed by anything. In other words, the trajectory of a kinematic body can only be
     * modified by the user and is independent from any contact or joint it is involved in.
     */
    RigidBodyType[RigidBodyType["KinematicVelocityBased"] = 3] = "KinematicVelocityBased";
})(RigidBodyType = exports.RigidBodyType || (exports.RigidBodyType = {}));
/**
 * A rigid-body.
 */
class RigidBody {
    constructor(rawSet, colliderSet, handle) {
        this.rawSet = rawSet;
        this.colliderSet = colliderSet;
        this.handle = handle;
    }
    /** @internal */
    finalizeDeserialization(colliderSet) {
        this.colliderSet = colliderSet;
    }
    /**
     * Checks if this rigid-body is still valid (i.e. that it has
     * not been deleted from the rigid-body set yet.
     */
    isValid() {
        return this.rawSet.contains(this.handle);
    }
    /**
     * Locks or unlocks the ability of this rigid-body to translate.
     *
     * @param locked - If `true`, this rigid-body will no longer translate due to forces and impulses.
     * @param wakeUp - If `true`, this rigid-body will be automatically awaken if it is currently asleep.
     */
    lockTranslations(locked, wakeUp) {
        return this.rawSet.rbLockTranslations(this.handle, locked, wakeUp);
    }
    /**
     * Locks or unlocks the ability of this rigid-body to rotate.
     *
     * @param locked - If `true`, this rigid-body will no longer rotate due to torques and impulses.
     * @param wakeUp - If `true`, this rigid-body will be automatically awaken if it is currently asleep.
     */
    lockRotations(locked, wakeUp) {
        return this.rawSet.rbLockRotations(this.handle, locked, wakeUp);
    }
    // #if DIM2
    /**
     * Locks or unlocks the ability of this rigid-body to translation along individual coordinate axes.
     *
     * @param enableX - If `false`, this rigid-body will no longer rotate due to torques and impulses, along the X coordinate axis.
     * @param enableY - If `false`, this rigid-body will no longer rotate due to torques and impulses, along the Y coordinate axis.
     * @param wakeUp - If `true`, this rigid-body will be automatically awaken if it is currently asleep.
     */
    setEnabledTranslations(enableX, enableY, wakeUp) {
        return this.rawSet.rbSetEnabledTranslations(this.handle, enableX, enableY, wakeUp);
    }
    /**
     * Locks or unlocks the ability of this rigid-body to translation along individual coordinate axes.
     *
     * @param enableX - If `false`, this rigid-body will no longer rotate due to torques and impulses, along the X coordinate axis.
     * @param enableY - If `false`, this rigid-body will no longer rotate due to torques and impulses, along the Y coordinate axis.
     * @param wakeUp - If `true`, this rigid-body will be automatically awaken if it is currently asleep.
     * @deprecated use `this.setEnabledTranslations` with the same arguments instead.
     */
    restrictTranslations(enableX, enableY, wakeUp) {
        this.setEnabledTranslations(enableX, enableX, wakeUp);
    }
    // #endif
    /**
     * The dominance group, in [-127, +127] this rigid-body is part of.
     */
    dominanceGroup() {
        return this.rawSet.rbDominanceGroup(this.handle);
    }
    /**
     * Sets the dominance group of this rigid-body.
     *
     * @param group - The dominance group of this rigid-body. Must be a signed integer in the range [-127, +127].
     */
    setDominanceGroup(group) {
        this.rawSet.rbSetDominanceGroup(this.handle, group);
    }
    /**
     * Enable or disable CCD (Continuous Collision Detection) for this rigid-body.
     *
     * @param enabled - If `true`, CCD will be enabled for this rigid-body.
     */
    enableCcd(enabled) {
        this.rawSet.rbEnableCcd(this.handle, enabled);
    }
    /**
     * The world-space translation of this rigid-body.
     */
    translation() {
        let res = this.rawSet.rbTranslation(this.handle);
        return math_1.VectorOps.fromRaw(res);
    }
    /**
     * The world-space orientation of this rigid-body.
     */
    rotation() {
        let res = this.rawSet.rbRotation(this.handle);
        return math_1.RotationOps.fromRaw(res);
    }
    /**
     * The world-space next translation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicTranslation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    nextTranslation() {
        let res = this.rawSet.rbNextTranslation(this.handle);
        return math_1.VectorOps.fromRaw(res);
    }
    /**
     * The world-space next orientation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    nextRotation() {
        let res = this.rawSet.rbNextRotation(this.handle);
        return math_1.RotationOps.fromRaw(res);
    }
    /**
     * Sets the translation of this rigid-body.
     *
     * @param tra - The world-space position of the rigid-body.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     *                 wasn't moving before modifying its position.
     */
    setTranslation(tra, wakeUp) {
        // #if DIM2
        this.rawSet.rbSetTranslation(this.handle, tra.x, tra.y, wakeUp);
        // #endif
    }
    /**
     * Sets the linear velocity fo this rigid-body.
     *
     * @param vel - The linear velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    setLinvel(vel, wakeUp) {
        let rawVel = math_1.VectorOps.intoRaw(vel);
        this.rawSet.rbSetLinvel(this.handle, rawVel, wakeUp);
        rawVel.free();
    }
    /**
     * The scale factor applied to the gravity affecting
     * this rigid-body.
     */
    gravityScale() {
        return this.rawSet.rbGravityScale(this.handle);
    }
    /**
     * Sets the scale factor applied to the gravity affecting
     * this rigid-body.
     *
     * @param factor - The scale factor to set. A value of 0.0 means
     *   that this rigid-body will on longer be affected by gravity.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    setGravityScale(factor, wakeUp) {
        this.rawSet.rbSetGravityScale(this.handle, factor, wakeUp);
    }
    // #if DIM2
    /**
     * Sets the rotation angle of this rigid-body.
     *
     * @param angle - The rotation angle, in radians.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     */
    setRotation(angle, wakeUp) {
        this.rawSet.rbSetRotation(this.handle, angle, wakeUp);
    }
    /**
     * Sets the angular velocity fo this rigid-body.
     *
     * @param vel - The angular velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    setAngvel(vel, wakeUp) {
        this.rawSet.rbSetAngvel(this.handle, vel, wakeUp);
    }
    // #endif
    /**
     * If this rigid body is kinematic, sets its future translation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setTranslation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param t - The kinematic translation to set.
     */
    setNextKinematicTranslation(t) {
        // #if DIM2
        this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y);
        // #endif
    }
    // #if DIM2
    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param angle - The kinematic rotation angle, in radians.
     */
    setNextKinematicRotation(angle) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, angle);
    }
    // #endif
    /**
     * The linear velocity of this rigid-body.
     */
    linvel() {
        return math_1.VectorOps.fromRaw(this.rawSet.rbLinvel(this.handle));
    }
    // #if DIM2
    /**
     * The angular velocity of this rigid-body.
     */
    angvel() {
        return this.rawSet.rbAngvel(this.handle);
    }
    // #endif
    /**
     * The mass of this rigid-body.
     */
    mass() {
        return this.rawSet.rbMass(this.handle);
    }
    /**
     * The inverse mass taking into account translation locking.
     */
    effectiveInvMass() {
        return math_1.VectorOps.fromRaw(this.rawSet.rbEffectiveInvMass(this.handle));
    }
    /**
     * The inverse of the mass of a rigid-body.
     *
     * If this is zero, the rigid-body is assumed to have infinite mass.
     */
    invMass() {
        return this.rawSet.rbInvMass(this.handle);
    }
    /**
     * The center of mass of a rigid-body expressed in its local-space.
     */
    localCom() {
        return math_1.VectorOps.fromRaw(this.rawSet.rbLocalCom(this.handle));
    }
    /**
     * The world-space center of mass of the rigid-body.
     */
    worldCom() {
        return math_1.VectorOps.fromRaw(this.rawSet.rbWorldCom(this.handle));
    }
    // #if DIM2
    /**
     * The inverse of the principal angular inertia of the rigid-body.
     *
     * Components set to zero are assumed to be infinite along the corresponding principal axis.
     */
    invPrincipalInertiaSqrt() {
        return this.rawSet.rbInvPrincipalInertiaSqrt(this.handle);
    }
    // #endif
    // #if DIM2
    /**
     * The angular inertia along the principal inertia axes of the rigid-body.
     */
    principalInertia() {
        return this.rawSet.rbPrincipalInertia(this.handle);
    }
    // #endif
    // #if DIM2
    /**
     * The square-root of the world-space inverse angular inertia tensor of the rigid-body,
     * taking into account rotation locking.
     */
    effectiveWorldInvInertiaSqrt() {
        return this.rawSet.rbEffectiveWorldInvInertiaSqrt(this.handle);
    }
    // #endif
    // #if DIM2
    /**
     * The effective world-space angular inertia (that takes the potential rotation locking into account) of
     * this rigid-body.
     */
    effectiveAngularInertia() {
        return this.rawSet.rbEffectiveAngularInertia(this.handle);
    }
    // #endif
    /**
     * Put this rigid body to sleep.
     *
     * A sleeping body no longer moves and is no longer simulated by the physics engine unless
     * it is waken up. It can be woken manually with `this.wakeUp()` or automatically due to
     * external forces like contacts.
     */
    sleep() {
        this.rawSet.rbSleep(this.handle);
    }
    /**
     * Wakes this rigid-body up.
     *
     * A dynamic rigid-body that does not move during several consecutive frames will
     * be put to sleep by the physics engine, i.e., it will stop being simulated in order
     * to avoid useless computations.
     * This methods forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
     * the position of a dynamic body so that it is properly simulated afterwards.
     */
    wakeUp() {
        this.rawSet.rbWakeUp(this.handle);
    }
    /**
     * Is CCD enabled for this rigid-body?
     */
    isCcdEnabled() {
        return this.rawSet.rbIsCcdEnabled(this.handle);
    }
    /**
     * The number of colliders attached to this rigid-body.
     */
    numColliders() {
        return this.rawSet.rbNumColliders(this.handle);
    }
    /**
     * Retrieves the `i-th` collider attached to this rigid-body.
     *
     * @param i - The index of the collider to retrieve. Must be a number in `[0, this.numColliders()[`.
     *         This index is **not** the same as the unique identifier of the collider.
     */
    collider(i) {
        return this.colliderSet.get(this.rawSet.rbCollider(this.handle, i));
    }
    /**
     * Sets whether this rigid-body is enabled or not.
     *
     * @param enabled - Set to `false` to disable this rigid-body and all its attached colliders.
     */
    setEnabled(enabled) {
        this.rawSet.rbSetEnabled(this.handle, enabled);
    }
    /**
     * Is this rigid-body enabled?
     */
    isEnabled() {
        return this.rawSet.rbIsEnabled(this.handle);
    }
    /**
     * The status of this rigid-body: static, dynamic, or kinematic.
     */
    bodyType() {
        return this.rawSet.rbBodyType(this.handle);
    }
    /**
     * Set a new status for this rigid-body: static, dynamic, or kinematic.
     */
    setBodyType(type, wakeUp) {
        return this.rawSet.rbSetBodyType(this.handle, type, wakeUp);
    }
    /**
     * Is this rigid-body sleeping?
     */
    isSleeping() {
        return this.rawSet.rbIsSleeping(this.handle);
    }
    /**
     * Is the velocity of this rigid-body not zero?
     */
    isMoving() {
        return this.rawSet.rbIsMoving(this.handle);
    }
    /**
     * Is this rigid-body static?
     */
    isFixed() {
        return this.rawSet.rbIsFixed(this.handle);
    }
    /**
     * Is this rigid-body kinematic?
     */
    isKinematic() {
        return this.rawSet.rbIsKinematic(this.handle);
    }
    /**
     * Is this rigid-body dynamic?
     */
    isDynamic() {
        return this.rawSet.rbIsDynamic(this.handle);
    }
    /**
     * The linear damping coefficient of this rigid-body.
     */
    linearDamping() {
        return this.rawSet.rbLinearDamping(this.handle);
    }
    /**
     * The angular damping coefficient of this rigid-body.
     */
    angularDamping() {
        return this.rawSet.rbAngularDamping(this.handle);
    }
    /**
     * Sets the linear damping factor applied to this rigid-body.
     *
     * @param factor - The damping factor to set.
     */
    setLinearDamping(factor) {
        this.rawSet.rbSetLinearDamping(this.handle, factor);
    }
    /**
     * Recompute the mass-properties of this rigid-bodies based on its currently attached colliders.
     */
    recomputeMassPropertiesFromColliders() {
        this.rawSet.rbRecomputeMassPropertiesFromColliders(this.handle, this.colliderSet.raw);
    }
    /**
     * Sets the rigid-body's additional mass.
     *
     * The total angular inertia of the rigid-body will be scaled automatically based on this additional mass. If this
     * scaling effect isn’t desired, use Self::additional_mass_properties instead of this method.
     *
     * This is only the "additional" mass because the total mass of the rigid-body is equal to the sum of this
     * additional mass and the mass computed from the colliders (with non-zero densities) attached to this rigid-body.
     *
     * That total mass (which includes the attached colliders’ contributions) will be updated at the name physics step,
     * or can be updated manually with `this.recomputeMassPropertiesFromColliders`.
     *
     * This will override any previous additional mass-properties set by `this.setAdditionalMass`,
     * `this.setAdditionalMassProperties`, `RigidBodyDesc::setAdditionalMass`, or
     * `RigidBodyDesc.setAdditionalMassfProperties` for this rigid-body.
     *
     * @param mass - The additional mass to set.
     * @param wakeUp - If `true` then the rigid-body will be woken up if it was put to sleep because it did not move for a while.
     */
    setAdditionalMass(mass, wakeUp) {
        this.rawSet.rbSetAdditionalMass(this.handle, mass, wakeUp);
    }
    // #if DIM2
    /**
     * Sets the rigid-body's additional mass-properties.
     *
     * This is only the "additional" mass-properties because the total mass-properties of the rigid-body is equal to the
     * sum of this additional mass-properties and the mass computed from the colliders (with non-zero densities) attached
     * to this rigid-body.
     *
     * That total mass-properties (which include the attached colliders’ contributions) will be updated at the name
     * physics step, or can be updated manually with `this.recomputeMassPropertiesFromColliders`.
     *
     * This will override any previous mass-properties set by `this.setAdditionalMass`,
     * `this.setAdditionalMassProperties`, `RigidBodyDesc.setAdditionalMass`, or `RigidBodyDesc.setAdditionalMassProperties`
     * for this rigid-body.
     *
     * If `wake_up` is true then the rigid-body will be woken up if it was put to sleep because it did not move for a while.
     */
    setAdditionalMassProperties(mass, centerOfMass, principalAngularInertia, wakeUp) {
        let rawCom = math_1.VectorOps.intoRaw(centerOfMass);
        this.rawSet.rbSetAdditionalMassProperties(this.handle, mass, rawCom, principalAngularInertia, wakeUp);
        rawCom.free();
    }
    // #endif
    /**
     * Sets the linear damping factor applied to this rigid-body.
     *
     * @param factor - The damping factor to set.
     */
    setAngularDamping(factor) {
        this.rawSet.rbSetAngularDamping(this.handle, factor);
    }
    /**
     * Resets to zero the user forces (but not torques) applied to this rigid-body.
     *
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    resetForces(wakeUp) {
        this.rawSet.rbResetForces(this.handle, wakeUp);
    }
    /**
     * Resets to zero the user torques applied to this rigid-body.
     *
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    resetTorques(wakeUp) {
        this.rawSet.rbResetTorques(this.handle, wakeUp);
    }
    /**
     * Adds a force at the center-of-mass of this rigid-body.
     *
     * @param force - the world-space force to add to the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    addForce(force, wakeUp) {
        const rawForce = math_1.VectorOps.intoRaw(force);
        this.rawSet.rbAddForce(this.handle, rawForce, wakeUp);
        rawForce.free();
    }
    /**
     * Applies an impulse at the center-of-mass of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    applyImpulse(impulse, wakeUp) {
        const rawImpulse = math_1.VectorOps.intoRaw(impulse);
        this.rawSet.rbApplyImpulse(this.handle, rawImpulse, wakeUp);
        rawImpulse.free();
    }
    // #if DIM2
    /**
     * Adds a torque at the center-of-mass of this rigid-body.
     *
     * @param torque - the torque to add to the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    addTorque(torque, wakeUp) {
        this.rawSet.rbAddTorque(this.handle, torque, wakeUp);
    }
    // #endif
    // #if DIM2
    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * @param torqueImpulse - the torque impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    applyTorqueImpulse(torqueImpulse, wakeUp) {
        this.rawSet.rbApplyTorqueImpulse(this.handle, torqueImpulse, wakeUp);
    }
    // #endif
    /**
     * Adds a force at the given world-space point of this rigid-body.
     *
     * @param force - the world-space force to add to the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    addForceAtPoint(force, point, wakeUp) {
        const rawForce = math_1.VectorOps.intoRaw(force);
        const rawPoint = math_1.VectorOps.intoRaw(point);
        this.rawSet.rbAddForceAtPoint(this.handle, rawForce, rawPoint, wakeUp);
        rawForce.free();
        rawPoint.free();
    }
    /**
     * Applies an impulse at the given world-space point of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    applyImpulseAtPoint(impulse, point, wakeUp) {
        const rawImpulse = math_1.VectorOps.intoRaw(impulse);
        const rawPoint = math_1.VectorOps.intoRaw(point);
        this.rawSet.rbApplyImpulseAtPoint(this.handle, rawImpulse, rawPoint, wakeUp);
        rawImpulse.free();
        rawPoint.free();
    }
}
exports.RigidBody = RigidBody;
class RigidBodyDesc {
    constructor(status) {
        this.enabled = true;
        this.status = status;
        this.translation = math_1.VectorOps.zeros();
        this.rotation = math_1.RotationOps.identity();
        this.gravityScale = 1.0;
        this.linvel = math_1.VectorOps.zeros();
        this.mass = 0.0;
        this.massOnly = false;
        this.centerOfMass = math_1.VectorOps.zeros();
        this.translationsEnabledX = true;
        this.translationsEnabledY = true;
        // #if DIM2
        this.angvel = 0.0;
        this.principalAngularInertia = 0.0;
        this.rotationsEnabled = true;
        // #endif
        this.linearDamping = 0.0;
        this.angularDamping = 0.0;
        this.canSleep = true;
        this.sleeping = false;
        this.ccdEnabled = false;
        this.dominanceGroup = 0;
    }
    /**
     * A rigid-body descriptor used to build a dynamic rigid-body.
     */
    static dynamic() {
        return new RigidBodyDesc(RigidBodyType.Dynamic);
    }
    /**
     * A rigid-body descriptor used to build a position-based kinematic rigid-body.
     */
    static kinematicPositionBased() {
        return new RigidBodyDesc(RigidBodyType.KinematicPositionBased);
    }
    /**
     * A rigid-body descriptor used to build a velocity-based kinematic rigid-body.
     */
    static kinematicVelocityBased() {
        return new RigidBodyDesc(RigidBodyType.KinematicVelocityBased);
    }
    /**
     * A rigid-body descriptor used to build a fixed rigid-body.
     */
    static fixed() {
        return new RigidBodyDesc(RigidBodyType.Fixed);
    }
    /**
     * A rigid-body descriptor used to build a dynamic rigid-body.
     *
     * @deprecated The method has been renamed to `.dynamic()`.
     */
    static newDynamic() {
        return new RigidBodyDesc(RigidBodyType.Dynamic);
    }
    /**
     * A rigid-body descriptor used to build a position-based kinematic rigid-body.
     *
     * @deprecated The method has been renamed to `.kinematicPositionBased()`.
     */
    static newKinematicPositionBased() {
        return new RigidBodyDesc(RigidBodyType.KinematicPositionBased);
    }
    /**
     * A rigid-body descriptor used to build a velocity-based kinematic rigid-body.
     *
     * @deprecated The method has been renamed to `.kinematicVelocityBased()`.
     */
    static newKinematicVelocityBased() {
        return new RigidBodyDesc(RigidBodyType.KinematicVelocityBased);
    }
    /**
     * A rigid-body descriptor used to build a fixed rigid-body.
     *
     * @deprecated The method has been renamed to `.fixed()`.
     */
    static newStatic() {
        return new RigidBodyDesc(RigidBodyType.Fixed);
    }
    setDominanceGroup(group) {
        this.dominanceGroup = group;
        return this;
    }
    /**
     * Sets whether the created rigid-body will be enabled or disabled.
     * @param enabled − If set to `false` the rigid-body will be disabled at creation.
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        return this;
    }
    // #if DIM2
    /**
     * Sets the initial translation of the rigid-body to create.
     */
    setTranslation(x, y) {
        if (typeof x != "number" || typeof y != "number")
            throw TypeError("The translation components must be numbers.");
        this.translation = { x: x, y: y };
        return this;
    }
    // #endif
    /**
     * Sets the initial rotation of the rigid-body to create.
     *
     * @param rot - The rotation to set.
     */
    setRotation(rot) {
        // #if DIM2
        this.rotation = rot;
        // #endif
        return this;
    }
    /**
     * Sets the scale factor applied to the gravity affecting
     * the rigid-body being built.
     *
     * @param scale - The scale factor. Set this to `0.0` if the rigid-body
     *   needs to ignore gravity.
     */
    setGravityScale(scale) {
        this.gravityScale = scale;
        return this;
    }
    /**
     * Sets the initial mass of the rigid-body being built, before adding colliders' contributions.
     *
     * @param mass − The initial mass of the rigid-body to create.
     */
    setAdditionalMass(mass) {
        this.mass = mass;
        this.massOnly = true;
        return this;
    }
    // #if DIM2
    /**
     * Sets the initial linear velocity of the rigid-body to create.
     *
     * @param x - The linear velocity to set along the `x` axis.
     * @param y - The linear velocity to set along the `y` axis.
     */
    setLinvel(x, y) {
        if (typeof x != "number" || typeof y != "number")
            throw TypeError("The linvel components must be numbers.");
        this.linvel = { x: x, y: y };
        return this;
    }
    /**
     * Sets the initial angular velocity of the rigid-body to create.
     *
     * @param vel - The angular velocity to set.
     */
    setAngvel(vel) {
        this.angvel = vel;
        return this;
    }
    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * Note that the final mass properties of the rigid-bodies depends
     * on the initial mass-properties of the rigid-body (set by this method)
     * to which is added the contributions of all the colliders with non-zero density
     * attached to this rigid-body.
     *
     * Therefore, if you want your provided mass properties to be the final
     * mass properties of your rigid-body, don't attach colliders to it, or
     * only attach colliders with densities equal to zero.
     *
     * @param mass − The initial mass of the rigid-body to create.
     * @param centerOfMass − The initial center-of-mass of the rigid-body to create.
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     */
    setAdditionalMassProperties(mass, centerOfMass, principalAngularInertia) {
        this.mass = mass;
        math_1.VectorOps.copy(this.centerOfMass, centerOfMass);
        this.principalAngularInertia = principalAngularInertia;
        this.massOnly = false;
        return this;
    }
    /**
     * Allow translation of this rigid-body only along specific axes.
     * @param translationsEnabledX - Are translations along the X axis enabled?
     * @param translationsEnabledY - Are translations along the y axis enabled?
     */
    enabledTranslations(translationsEnabledX, translationsEnabledY) {
        this.translationsEnabledX = translationsEnabledX;
        this.translationsEnabledY = translationsEnabledY;
        return this;
    }
    /**
     * Allow translation of this rigid-body only along specific axes.
     * @param translationsEnabledX - Are translations along the X axis enabled?
     * @param translationsEnabledY - Are translations along the y axis enabled?
     * @deprecated use `this.enabledTranslations` with the same arguments instead.
     */
    restrictTranslations(translationsEnabledX, translationsEnabledY) {
        return this.enabledTranslations(translationsEnabledX, translationsEnabledY);
    }
    /**
     * Locks all translations that would have resulted from forces on
     * the created rigid-body.
     */
    lockTranslations() {
        return this.restrictTranslations(false, false);
    }
    /**
     * Locks all rotations that would have resulted from forces on
     * the created rigid-body.
     */
    lockRotations() {
        this.rotationsEnabled = false;
        return this;
    }
    // #endif
    /**
     * Sets the linear damping of the rigid-body to create.
     *
     * This will progressively slowdown the translational movement of the rigid-body.
     *
     * @param damping - The angular damping coefficient. Should be >= 0. The higher this
     *                  value is, the stronger the translational slowdown will be.
     */
    setLinearDamping(damping) {
        this.linearDamping = damping;
        return this;
    }
    /**
     * Sets the angular damping of the rigid-body to create.
     *
     * This will progressively slowdown the rotational movement of the rigid-body.
     *
     * @param damping - The angular damping coefficient. Should be >= 0. The higher this
     *                  value is, the stronger the rotational slowdown will be.
     */
    setAngularDamping(damping) {
        this.angularDamping = damping;
        return this;
    }
    /**
     * Sets whether or not the rigid-body to create can sleep.
     *
     * @param can - true if the rigid-body can sleep, false if it can't.
     */
    setCanSleep(can) {
        this.canSleep = can;
        return this;
    }
    /**
     * Sets whether or not the rigid-body is to be created asleep.
     *
     * @param can - true if the rigid-body should be in sleep, default false.
     */
    setSleeping(sleeping) {
        this.sleeping = sleeping;
        return this;
    }
    /**
     * Sets whether Continuous Collision Detection (CCD) is enabled for this rigid-body.
     *
     * @param enabled - true if the rigid-body has CCD enabled.
     */
    setCcdEnabled(enabled) {
        this.ccdEnabled = enabled;
        return this;
    }
    /**
     * Sets the user-defined object of this rigid-body.
     *
     * @param userData - The user-defined object to set.
     */
    setUserData(data) {
        this.userData = data;
        return this;
    }
}
exports.RigidBodyDesc = RigidBodyDesc;
//# sourceMappingURL=rigid_body.js.map