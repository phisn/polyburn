import { EntityRegisterEntry, EntityRegistry, EntityType } from "./Entity"
import greenFlag from "../../assets/flag-green.svg"
import redFlag from "../../assets/flag-red.svg"
import rocket from "../../assets/rocket.svg"

export const entities: EntityRegistry = {
    [EntityType.Rocket]: {
        scale: 0.5,
        size: { width: 300, height: 600 },
        anchor: { x: 0.5, y: 1 },
        src: rocket,
    },
    [EntityType.GreenFlag]: {
        scale: 0.5,
        size: { width: 275, height: 436 },
        anchor: { x: 0.0, y: 1 },
        src: greenFlag,
    },
    [EntityType.RedFlag]: {
        scale: 0.5,
        size: { width: 275, height: 436 },
        anchor: { x: 0.0, y: 1 },
        src: redFlag,
    },
}
