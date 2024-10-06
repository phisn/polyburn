import { fetch } from "./worker/fetch"

// initialize rapier wasm special for cloudflare workers
import * as imports from "@dimforge/rapier2d/rapier_wasm2d_bg"
import _wasm from "../../../node_modules/@dimforge/rapier2d/rapier_wasm2d_bg.wasm"
imports.__setWasm(new WebAssembly.Instance(_wasm, { "./rapier_wasm2d_bg.js": imports }).exports)

export default {
    fetch: fetch,
}

export * from "./do-lobby/do-lobby"
