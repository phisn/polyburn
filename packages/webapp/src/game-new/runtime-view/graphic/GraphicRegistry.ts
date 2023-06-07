import { EntityType } from "runtime/src/core/EntityType"

import { FlagGraphic } from "../graphics/FlagGraphic"
import { RocketGraphic } from "../graphics/RocketGraphic"
import { ShapeGraphic } from "../graphics/ShapeGraphc"
import { Graphic } from "./GraphicComponent"

export const graphicRegistry: { [key: string]: Graphic } = {
    [EntityType.Flag]: FlagGraphic,
    [EntityType.Rocket]: RocketGraphic,
    [EntityType.Shape]: ShapeGraphic,
}
