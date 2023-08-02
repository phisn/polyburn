import { GamemodeState, WorldState } from "../../../models/WorldState"

export function gamemodeToggleGroup(gamemode: GamemodeState, group: string) {
    const toggle = () => {
        const index = gamemode.groups.indexOf(group)

        if (index === -1) {
            gamemode.groups.push(group)
        } else {
            gamemode.groups.splice(index, 1)
        }
    }

    return {
        do(state: WorldState) {
            toggle()
        },
        undo(state: WorldState) {
            toggle()
        },
    }
}
