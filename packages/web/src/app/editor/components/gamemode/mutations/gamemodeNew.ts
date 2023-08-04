import { WorldState } from "../../../models/WorldState"

export function gamemodeNew(name: string) {
    const gamemode = {
        name: name,
        groups: [],
    }

    return {
        do(state: WorldState) {
            state.gamemodes.push(gamemode)
        },
        undo(state: WorldState) {
            state.gamemodes.splice(state.gamemodes.length - 1, 1)
        },
    }
}
