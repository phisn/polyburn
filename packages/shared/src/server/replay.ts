import { Point } from "game/src/model/utils"

export interface ReplayDTO extends ReplaySummaryDTO {
    frames: ReplayFrameDTO[]
}

export interface ReplayFrameDTO {
    position: Point
    rotation: number
    thurst: boolean
}

export interface ReplaySummaryDTO {
    deaths: number
    gamemode: string
    id: string
    ticks: number
    rank: number
    username: string
    worldname: string
}
