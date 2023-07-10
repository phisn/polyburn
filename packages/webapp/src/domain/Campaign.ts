interface Campaign {
    levels: Level[]
}

interface Level {
    name: string
    releaseDate: Date
}

interface Gamemode {
    name: string
}

interface LevelWithGamemode {
    level: Level
    gamemode: Gamemode
    authorTime: number
}

interface Replay {
    ticks: number
    deaths: number

    gamemode: Gamemode
    level: Level
    
    position: number
}

type SkinUnlock = void

/*
- get a world record on a official map in normal (at least 7 days after release)
- beat all hard maps on hard gamemode without dying
- 
*/

interface Skin {

}
