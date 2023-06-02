import { EntityType } from "runtime/src/core/EntityType"

import { Rocket } from "../../graphics/Rocket"
import { Graphic } from "./GraphicComponent"

export const graphicRegistry: { [key: string]: Graphic } = {
    [EntityType.Flag]: null!,
    [EntityType.Rocket]: Rocket,
    [EntityType.Shape]: null!,
}
