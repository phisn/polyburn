import { ReplaySummaryDTO } from "./replay"

export interface WorldDTO {
    worldname: string
    image: string

    gamemodes: GamemodeDTO[]
    model?: string
}

export interface GamemodeDTO {
    name: string
    replaySummary?: ReplaySummaryDTO
}
