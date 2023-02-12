import { useApp, useTick } from "@inlet/react-pixi"
import { useCallback, useEffect, useRef } from "react"
import useGameStore, { GameState, GameStore } from "./GameStore"
import * as PIXI from "pixi.js"

export function GameVisual() { 
    const app = useApp()
   
    const objectSpritesRef = useRef<PIXI.Sprite[]>([])
    const graphicsRef = useRef<PIXI.Graphics | undefined>()

    const update = useCallback((state: GameStore) => {
        const draw = (g: PIXI.Graphics) => {
            if (state.world == null) {
                return
            }

            g.clear()

            for (const [_, shape] of state.world.shapes.entries()) {
                g.lineStyle(0)
                g.beginFill(0xbb3333)
                g.drawPolygon(shape.vertices)
                g.endFill()
            }

            for (const [i, pair] of state.objectBodies.entries()) {
                // pair.body
                // pair.object
                // draw pair.body as circle

                g.lineStyle(0)
                g.beginFill(0x3333bb)
                g.drawCircle(pair.body.translation().x, pair.body.translation().y, 10)
                g.endFill()
            }
        }

        if (graphicsRef.current == undefined) {
            const graphics = new PIXI.Graphics()
            app.stage.addChild(graphics)
            graphicsRef.current = graphics
        }

        draw(graphicsRef.current)
    }, [ app ])

    useEffect(() => {
        update(useGameStore.getState())
        return useGameStore.subscribe(update)
    }), [ app ]

    const rapierWorld = useGameStore(state => state.rapierWorld)

    useEffect(() => {
        // every rapierWorld?.timestep
        const interval = setInterval(() => {
            rapierWorld?.step()
            update(useGameStore.getState())
            rapierWorld?.bodies.forEach((body) => {
                console.log(body.translation())
            })
        }, rapierWorld?.timestep)

        return () => {
            clearInterval(interval)
        }
    })

    return (
        <>
        </>
    )
}