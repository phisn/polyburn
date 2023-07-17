import { defaultConfig } from "../core/RuntimeConfig"
import { Gamemode } from "./Gamemode"
import { newGamemode } from "./GamemodeTemplate"

export const hardGamemode: Gamemode = newGamemode({
    ...defaultConfig,
})
