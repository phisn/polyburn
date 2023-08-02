import { WorldState } from "../../../models/WorldState"

export function gamemodeNew(name: string) {
    return {
        do(state: WorldState) {
            state.gamemodes.push({
                name: name,
                groups: [],
            })
        },
        undo(state: WorldState) {
            state.gamemodes.splice(state.gamemodes.length - 1, 1)
        },
    }
}
