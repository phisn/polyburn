import { Entity } from "runtime-framework"

export type Graphic = (props: { entity: Entity}) => JSX.Element

export interface GraphicComponent {
    graphic: Graphic
}
