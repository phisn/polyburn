import { useApp, useTick } from "@inlet/react-pixi"
import { useCallback, useEffect, useRef } from "react"
import useGameStore, { GameState, GameStore } from "./GameStore"
import * as PIXI from "pixi.js"

export function GameVisual() { 
    const app = useApp()
   
    const rocketSpriteRef = useRef<PIXI.Sprite>()
    const graphicsRef = useRef<PIXI.Graphics>()

    const update = useCallback((store: GameStore) => {
        if (store.state == null) {
            return
        }
        
        if (rocketSpriteRef.current === undefined) {
            const sprite = new PIXI.Sprite()
            app.stage.addChild(sprite)
            rocketSpriteRef.current = sprite
            
            rocketSpriteRef.current.texture = PIXI.Texture.from(
                store.state.rocketObject.placeable.src)
            rocketSpriteRef.current.anchor.set(0, 0)
            rocketSpriteRef.current.scale.set(store.state.rocketObject.placeable.scale)
        }

        rocketSpriteRef.current.position.set(
            store.state.rocket.translation().x,
            store.state.rocket.translation().y)
        rocketSpriteRef.current.rotation = store.state.rocket.rotation()

        const draw = (g: PIXI.Graphics) => {
            if (store.state == null) {
                return
            }

            g.clear()

            for (const [_, shape] of store.state.world.shapes.entries()) {
                g.lineStyle(0)
                g.beginFill(0xbb3333)
                g.drawPolygon(shape.vertices)
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

    const rapierWorld = useGameStore(store => store.state?.rapierWorld)

    useEffect(() => {
        // every rapierWorld?.timestep
        const interval = setInterval(() => {
            rapierWorld?.step()
            update(useGameStore.getState())
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