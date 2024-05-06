"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IslandManager = void 0;
const raw_1 = require("../raw");
/**
 * The CCD solver responsible for resolving Continuous Collision Detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `ccdSolver.free()`
 * once you are done using it.
 */
class IslandManager {
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
        this.raw = raw || new raw_1.RawIslandManager();
    }
    /**
     * Applies the given closure to the handle of each active rigid-bodies contained by this set.
     *
     * A rigid-body is active if it is not sleeping, i.e., if it moved recently.
     *
     * @param f - The closure to apply.
     */
    forEachActiveRigidBodyHandle(f) {
        this.raw.forEachActiveRigidBodyHandle(f);
    }
}
exports.IslandManager = IslandManager;
//# sourceMappingURL=island_manager.js.map