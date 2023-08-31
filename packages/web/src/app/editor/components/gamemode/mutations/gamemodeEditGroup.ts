import { WorldState } from "../../../models/WorldState"

export function gamemodeEditGroup(previousName: string, newName: string) {
    return {
        do(state: WorldState) {
            for (const gamemode of state.gamemodes) {
                for (let i = 0; i < gamemode.groups.length; i++) {
                    if (gamemode.groups[i] === previousName) {
                        gamemode.groups[i] = newName
                    }
                }
            }

            for (const [, entity] of state.entities) {
                if (entity.group === previousName) {
                    entity.group = newName
                }
            }
        },
        undo(state: WorldState) {
            state.gamemodes.splice(state.gamemodes.length - 1, 1)
        },
    }
}
