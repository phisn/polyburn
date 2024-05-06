"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCDSolver = void 0;
const raw_1 = require("../raw");
/**
 * The CCD solver responsible for resolving Continuous Collision Detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `ccdSolver.free()`
 * once you are done using it.
 */
class CCDSolver {
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
        this.raw = raw || new raw_1.RawCCDSolver();
    }
}
exports.CCDSolver = CCDSolver;
//# sourceMappingURL=ccd_solver.js.map