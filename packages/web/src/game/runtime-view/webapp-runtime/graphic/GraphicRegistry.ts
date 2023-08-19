import { EntityType } from "runtime/proto/world"

import { FlagGraphic } from "../../graphics/FlagGraphic"
import { RocketGraphic } from "../../graphics/RocketGraphic"
import { ShapeGraphic } from "../../graphics/ShapeGraphic"
import { Graphic } from "./GraphicComponent"

export const graphicRegistry: { [K in EntityType]: Graphic } = {
    [EntityType.LEVEL]: FlagGraphic,
    [EntityType.ROCKET]: RocketGraphic,
    [EntityType.SHAPE]: ShapeGraphic,
}
