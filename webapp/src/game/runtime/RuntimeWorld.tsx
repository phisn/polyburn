
import RAPIER from "@dimforge/rapier2d-compat"
import { useThree } from "@react-three/fiber"
import { useRef } from "react"
import { suspend } from "suspend-react"

import { EntityType } from "../../model/world/Entity"
import { World } from "../../model/world/World"
import { createRocket } from "./RuntimeRocket"
import { UpdateContext } from "./UpdateContext"
import { useGameLoop } from "./useGameLoop"

const init = RAPIER.init()

export function RuntimeWorld(props: { world: World }) {
    suspend(() => init, [])

    
    props.world.shapes.forEach(() =>
        void 0
    )
    
    const rapierRef = useRef(new RAPIER.World({ x: 0.0, y: -9.81 * 4 }))
    const sceneRef = useRef(useThree(state => state.scene))

    console.log("Rendering")

    const rockets = suspend(async () => {
        try {
            console.log("Creating rockets")
            const promise = Promise.all(
                props.world.entities
                    .filter(entity => entity.type === EntityType.Rocket)
                    .map(entity => createRocket(sceneRef.current, rapierRef.current, entity))
            )

            console.log("Promise: ", promise)

            return await promise
        }
        catch (e) {
            console.error(e)
            throw e
        }
    }, [props.world])

    console.log("Rockets: ", rockets)

    const updateContextRef = useRef<UpdateContext>(
        {
            thrust: false
        }
    )

    console.log("Rendering")

    useGameLoop(() => {
        console.log("Updating")
        rapierRef.current.step()
        rockets.forEach(rocket => rocket.update(updateContextRef.current))
    }, () => {
        rockets.forEach(rocket => rocket.updateGraphics())
    })

    return <></>
}
