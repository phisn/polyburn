"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsPipeline = void 0;
const raw_1 = require("../raw");
const math_1 = require("../math");
class PhysicsPipeline {
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    constructor(raw) {
        this.raw = raw || new raw_1.RawPhysicsPipeline();
    }
    step(gravity, integrationParameters, islands, broadPhase, narrowPhase, bodies, colliders, impulseJoints, multibodyJoints, ccdSolver, eventQueue, hooks) {
        let rawG = math_1.VectorOps.intoRaw(gravity);
        if (!!eventQueue) {
            this.raw.stepWithEvents(rawG, integrationParameters.raw, islands.raw, broadPhase.raw, narrowPhase.raw, bodies.raw, colliders.raw, impulseJoints.raw, multibodyJoints.raw, ccdSolver.raw, eventQueue.raw, hooks, !!hooks ? hooks.filterContactPair : null, !!hooks ? hooks.filterIntersectionPair : null);
        }
        else {
            this.raw.step(rawG, integrationParameters.raw, islands.raw, broadPhase.raw, narrowPhase.raw, bodies.raw, colliders.raw, impulseJoints.raw, multibodyJoints.raw, ccdSolver.raw);
        }
        rawG.free();
    }
}
exports.PhysicsPipeline = PhysicsPipeline;
//# sourceMappingURL=physics_pipeline.js.map