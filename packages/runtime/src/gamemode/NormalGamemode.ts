import { defaultConfig } from "../core/RuntimeConfig"
import { Gamemode } from "./Gamemode"
import { newGamemode } from "./GamemodeTemplate"

export const normalGamemode: Gamemode = newGamemode(defaultConfig)
