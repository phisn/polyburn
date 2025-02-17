import { Point } from "game/src/model/utils"

export interface ReplayDTO extends ReplaySummaryDTO {}

export interface ReplayFrameDTO {
    position: Point
    rotation: number
    thrust: boolean
}

export interface ReplaySummaryDTO {
    deaths: number
    replayUrl: string
    gamemode: string
    id: string
    ticks: number
    rank: number
    username: string
    worldname: string
}
