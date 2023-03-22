import RAPIER from "@dimforge/rapier2d-compat"

import { FlagEntity } from "../../model/world/Entity"
import { Point } from "../../model/world/Point"

export interface LevelModel {
    unlocked: boolean,
    camera: {
        topLeft: Point
        bottomRight: Point
    },
    flag: Point
    flagRotation: number
}

export function createLevel(    
    rapier: RAPIER.World, 
    flag: FlagEntity
): LevelModel {
    const camera = {
        topLeft: flag.cameraTopLeft,
        bottomRight: flag.cameraBottomRight
    }

    return {
        unlocked: false,
        camera,
        flag: flag.position,
        flagRotation: flag.rotation
    }
}
