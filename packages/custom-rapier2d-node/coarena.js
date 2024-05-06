"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coarena = void 0;
class Coarena {
    constructor() {
        this.fconv = new Float64Array(1);
        this.uconv = new Uint32Array(this.fconv.buffer);
        this.data = new Array();
        this.size = 0;
    }
    set(handle, data) {
        let i = this.index(handle);
        while (this.data.length <= i) {
            this.data.push(null);
        }
        if (this.data[i] == null)
            this.size += 1;
        this.data[i] = data;
    }
    len() {
        return this.size;
    }
    delete(handle) {
        let i = this.index(handle);
        if (i < this.data.length) {
            if (this.data[i] != null)
                this.size -= 1;
            this.data[i] = null;
        }
    }
    clear() {
        this.data = new Array();
    }
    get(handle) {
        let i = this.index(handle);
        if (i < this.data.length) {
            return this.data[i];
        }
        else {
            return null;
        }
    }
    forEach(f) {
        for (const elt of this.data) {
            if (elt != null)
                f(elt);
        }
    }
    getAll() {
        return this.data.filter((elt) => elt != null);
    }
    index(handle) {
        /// Extracts the index part of a handle (the lower 32 bits).
        /// This is done by first injecting the handle into an Float64Array
        /// which is itself injected into an Uint32Array (at construction time).
        /// The 0-th value of the Uint32Array will become the `number` integer
        /// representation of the lower 32 bits.
        /// Also `this.uconv[1]` then contains the generation number as a `number`,
        /// which we don’t really need.
        this.fconv[0] = handle;
        return this.uconv[0];
    }
}
exports.Coarena = Coarena;
//# sourceMappingURL=coarena.js.map