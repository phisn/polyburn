import { Point } from "game/src/model/utils"

export interface ReplayDTO {
    frames: ReplayFrameDTO[]
}

export interface ReplayFrameDTO {
    position: Point
    rotation: number
    thurst: boolean
}

export interface ReplaySummaryDTO {
    deaths: number
    id: string
    ticks: number
    rank: number
    username: string
}
