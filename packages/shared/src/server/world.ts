import { ReplaySummaryDTO } from "./replay"

export interface WorldIdentifier {
    name: string
    version: number
}

export interface WorldDTO {
    id: WorldIdentifier
    image: string

    gamemodes?: GamemodeDTO[]
    model?: string
}

export interface GamemodeDTO {
    name: string
    replaySummary?: ReplaySummaryDTO
}
