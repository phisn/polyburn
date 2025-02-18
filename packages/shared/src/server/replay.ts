export interface ReplayDTO extends ReplaySummaryDTO {}

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
