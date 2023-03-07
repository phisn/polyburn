import { Entity, EntityRegisterEntry, EntityRegistry, EntityType } from "./Entity"

import greenFlag from "../../assets/flag-green.svg"
import redFlag from "../../assets/flag-red.svg"
import rocket from "../../assets/rocket.svg"
import { scale } from "./Size"
import { Point } from "./Point"
import { changeAnchor } from "../../utility/math"

export const entities: EntityRegistry = {
    [EntityType.Rocket]: {
        scale: 0.15,
        size: { width: 300, height: 600 },
        anchor: { x: 0, y: 1 },
        src: rocket,
    },
    [EntityType.GreenFlag]: {
        scale: 0.15,
        size: { width: 275, height: 436 },
        anchor: { x: 0, y: 1 },
        src: greenFlag,
    },
    [EntityType.RedFlag]: {
        scale: 0.15,
        size: { width: 275, height: 436 },
        anchor: { x: 0, y: 1 },
        src: redFlag,
    },
}


export function isPointInsideEntity({x, y}: Point, entity: Entity) {
    const { position, rotation } = entity
    const entry = entities[entity.type]

    const triangleArea = (a: Point, b: Point, c: Point) => {
        return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2)
    }
  
    // Compute the position and size of the entity's bounding box
    const topLeft = changeAnchor(
        position, 
        rotation, 
        scale(entry.size, entry.scale),
        entry.anchor,
        { x: 0, y: 0 })

    const bottomRight = changeAnchor(
        position, 
        rotation, 
        scale(entry.size, entry.scale),
        entry.anchor,
        { x: 1, y: 1 })

    
    const topRight = {
        x: bottomRight.x,
        y: topLeft.y,
    }

    const bottomLeft = {
        x: topLeft.x,
        y: bottomRight.y,
    }

    const apd = triangleArea(topLeft, 

    const boundingBox = {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    }
  
    // Check if the point is inside the bounding box
    return x >= boundingBox.x && x < boundingBox.x + boundingBox.width &&
           y >= boundingBox.y && y < boundingBox.y + boundingBox.height
  }
