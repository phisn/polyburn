import { ReplayPrepared } from "./prepare/ReplayPrepared"

export interface ReplayComponent {
    prepared: ReplayPrepared
    frame: number
}
