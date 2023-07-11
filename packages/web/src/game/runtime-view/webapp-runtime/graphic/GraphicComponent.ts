import { Entity } from "runtime-framework"

import { WebappComponents } from "../WebappComponents"

export type Graphic = (props: {
    entity: Entity<WebappComponents>
}) => JSX.Element
export type GraphicComponent = Graphic
