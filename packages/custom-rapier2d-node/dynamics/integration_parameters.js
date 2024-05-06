"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationParameters = void 0;
const raw_1 = require("../raw");
class IntegrationParameters {
    constructor(raw) {
        this.raw = raw || new raw_1.RawIntegrationParameters();
    }
    /**
     * Free the WASM memory used by these integration parameters.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    /**
     * The timestep length (default: `1.0 / 60.0`)
     */
    get dt() {
        return this.raw.dt;
    }
    /**
     * The Error Reduction Parameter in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get erp() {
        return this.raw.erp;
    }
    /**
     * Amount of penetration the engine wont attempt to correct (default: `0.001m`).
     */
    get allowedLinearError() {
        return this.raw.allowedLinearError;
    }
    /**
     * The maximal distance separating two objects that will generate predictive contacts (default: `0.002`).
     */
    get predictionDistance() {
        return this.raw.predictionDistance;
    }
    /**
     * Maximum number of iterations performed by the velocity constraints solver (default: `4`).
     */
    get maxVelocityIterations() {
        return this.raw.maxVelocityIterations;
    }
    /**
     * Maximum number of friction iterations performed by the position-based constraints solver (default: `1`).
     */
    get maxVelocityFrictionIterations() {
        return this.raw.maxVelocityFrictionIterations;
    }
    /**
     * Maximum number of stabilization iterations performed by the position-based constraints solver (default: `1`).
     */
    get maxStabilizationIterations() {
        return this.raw.maxStabilizationIterations;
    }
    /**
     * Minimum number of dynamic bodies in each active island (default: `128`).
     */
    get minIslandSize() {
        return this.raw.minIslandSize;
    }
    /**
     * Maximum number of substeps performed by the  solver (default: `1`).
     */
    get maxCcdSubsteps() {
        return this.raw.maxCcdSubsteps;
    }
    set dt(value) {
        this.raw.dt = value;
    }
    set erp(value) {
        this.raw.erp = value;
    }
    set allowedLinearError(value) {
        this.raw.allowedLinearError = value;
    }
    set predictionDistance(value) {
        this.raw.predictionDistance = value;
    }
    set maxVelocityIterations(value) {
        this.raw.maxVelocityIterations = value;
    }
    set maxVelocityFrictionIterations(value) {
        this.raw.maxVelocityFrictionIterations = value;
    }
    set maxStabilizationIterations(value) {
        this.raw.maxStabilizationIterations = value;
    }
    set minIslandSize(value) {
        this.raw.minIslandSize = value;
    }
    set maxCcdSubsteps(value) {
        this.raw.maxCcdSubsteps = value;
    }
}
exports.IntegrationParameters = IntegrationParameters;
//# sourceMappingURL=integration_parameters.js.map