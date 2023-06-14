import { EntityType } from "runtime/src/core/EntityType"

import { FlagGraphic } from "../../graphics/FlagGraphic"
import { RocketGraphic } from "../../graphics/RocketGraphic"
import { ShapeGraphic } from "../../graphics/ShapeGraphic"
import { Graphic } from "./GraphicComponent"

export const graphicRegistry: { [K in EntityType]: Graphic } = {
    [EntityType.Level]: FlagGraphic,
    [EntityType.Rocket]: RocketGraphic,
    [EntityType.Shape]: ShapeGraphic,
}
