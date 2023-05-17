import { useFrame } from "@react-three/fiber"

import { Point } from "../../model/world/Point"
import { RuntimeState } from "../runtime/RuntimeState"

function useInterpolationRunner(
    runtime: RuntimeState
) {
    useFrame(() => {
        const bodies: {
            [handle: number]: {
                position: Point,
                rotation: number
            }
        } = {}
        
        runtime.meta.rapier.

            runtime.meta.rapier.bodies.forEach((body) => {
                if (body.isSleeping()) {
                    return
                }

                bodies[body.handle] = {
                    position: body.translation(),
                    rotation: body.rotation()
                }
            })


    })
}