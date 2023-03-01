import greenFlag from "../../../assets/flag-green.svg"
import redFlag from "../../../assets/flag-red.svg"
import rocket from "../../../assets/rocket.svg"
import { PlaceableObject, PlaceableObjectType } from "../../World"

export type PlaceableObjectSelectable = PlaceableObject & {
    className: string
}

export const placeableObjects: PlaceableObjectSelectable[] = [
    { src: redFlag,   type: PlaceableObjectType.RedFlag,   anchor: { x: 0.0, y: 1 },   size: { width: 275, height: 436 }, scale: 0.15, className: "pl-2" },
    { src: greenFlag, type: PlaceableObjectType.GreenFlag, anchor: { x: 0.0, y: 1 },   size: { width: 275, height: 436 }, scale: 0.15, className: "pl-2" },
    { src: rocket,    type: PlaceableObjectType.Rocket,    anchor: { x: 0.5, y: 1 },   size: { width: 300, height: 600 }, scale: 0.15, className: "h-12" },
]