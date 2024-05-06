"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadPhase = void 0;
const raw_1 = require("../raw");
/**
 * The broad-phase used for coarse collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `broadPhase.free()`
 * once you are done using it.
 */
class BroadPhase {
    /**
     * Release the WASM memory occupied by this broad-phase.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    constructor(raw) {
        this.raw = raw || new raw_1.RawBroadPhase();
    }
}
exports.BroadPhase = BroadPhase;
//# sourceMappingURL=broad_phase.js.map