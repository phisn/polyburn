"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugRenderPipeline = exports.DebugRenderBuffers = void 0;
const raw_1 = require("../raw");
/**
 * The vertex and color buffers for debug-redering the physics scene.
 */
class DebugRenderBuffers {
    constructor(vertices, colors) {
        this.vertices = vertices;
        this.colors = colors;
    }
}
exports.DebugRenderBuffers = DebugRenderBuffers;
/**
 * A pipeline for rendering the physics scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `debugRenderPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
class DebugRenderPipeline {
    /**
     * Release the WASM memory occupied by this serialization pipeline.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
        this.vertices = undefined;
        this.colors = undefined;
    }
    constructor(raw) {
        this.raw = raw || new raw_1.RawDebugRenderPipeline();
    }
    render(bodies, colliders, impulse_joints, multibody_joints, narrow_phase) {
        this.raw.render(bodies.raw, colliders.raw, impulse_joints.raw, multibody_joints.raw, narrow_phase.raw);
        this.vertices = this.raw.vertices();
        this.colors = this.raw.colors();
    }
}
exports.DebugRenderPipeline = DebugRenderPipeline;
//# sourceMappingURL=debug_render_pipeline.js.map