import { GamemodeState, WorldState } from "../../../models/WorldState"

export function gamemodeRename(gamemode: GamemodeState, name: string) {
    const previousName = gamemode.name

    return {
        do(state: WorldState) {
            gamemode.name = name
        },
        undo(state: WorldState) {
            gamemode.name = previousName
        },
    }
}
