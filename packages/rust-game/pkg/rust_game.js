import * as wasm from "./rust_game_bg.wasm";
import { __wbg_set_wasm } from "./rust_game_bg.js";
__wbg_set_wasm(wasm);
export * from "./rust_game_bg.js";
