export interface WorldLeaderboard {
    entries: WorldLeaderboardEntry[]
}

export interface WorldLeaderboardEntry {
    leaderboardId: number
    place: number
    username: string
    ticks: number
    deaths: number
}
