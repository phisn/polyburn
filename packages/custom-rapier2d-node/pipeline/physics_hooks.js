"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolverFlags = exports.ActiveHooks = void 0;
var ActiveHooks;
(function (ActiveHooks) {
    ActiveHooks[ActiveHooks["FILTER_CONTACT_PAIRS"] = 1] = "FILTER_CONTACT_PAIRS";
    ActiveHooks[ActiveHooks["FILTER_INTERSECTION_PAIRS"] = 2] = "FILTER_INTERSECTION_PAIRS";
    // MODIFY_SOLVER_CONTACTS = 0b0100, /* Not supported yet in JS. */
})(ActiveHooks = exports.ActiveHooks || (exports.ActiveHooks = {}));
var SolverFlags;
(function (SolverFlags) {
    SolverFlags[SolverFlags["EMPTY"] = 0] = "EMPTY";
    SolverFlags[SolverFlags["COMPUTE_IMPULSE"] = 1] = "COMPUTE_IMPULSE";
})(SolverFlags = exports.SolverFlags || (exports.SolverFlags = {}));
//# sourceMappingURL=physics_hooks.js.map