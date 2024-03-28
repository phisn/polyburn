import { GamemodeState } from "../../../models/world-state"

export function gamemodeRename(gamemode: GamemodeState, name: string) {
    const previousName = gamemode.name

    return {
        do() {
            gamemode.name = name
        },
        undo() {
            gamemode.name = previousName
        },
    }
}
