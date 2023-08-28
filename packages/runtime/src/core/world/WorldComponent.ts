import { Replay } from "../../model/replay/Replay"
import { RuntimeSystemContext } from "../RuntimeSystemStack"

export interface WorldComponent {
    ticks: number
    finished: boolean
}
