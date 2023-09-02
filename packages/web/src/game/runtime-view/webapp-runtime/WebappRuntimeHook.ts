import { ReplayModel } from "runtime/proto/replay"

export interface WebappRuntimeHook {
    finished?: (replay: ReplayModel) => void
}
