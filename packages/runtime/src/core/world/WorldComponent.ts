import { RuntimeSystemContext } from "../RuntimeSystemStack"

export interface WorldComponent {
    replay: RuntimeSystemContext[]
    ticks: number
    finished: boolean
}
