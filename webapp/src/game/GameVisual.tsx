import { useApp, useTick } from "@inlet/react-pixi"
import { useCallback, useEffect, useRef, useState } from "react"
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
            rocketSpriteRef.current.anchor.set(0.5, 0.5)
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

    const state = useGameStore(store => 
        store.state != null ? ({
            rapierWorld: store.state.rapierWorld,
            rocket: store.state.rocket,
            initialRotation: store.state.rocket.rotation()
    }) : null)
    
    const spacebarPressedRef = useRef<boolean>(false)
    const rotation = useRef<number>(0)

    useEffect(() => {
        if (state != null) {
            rotation.current = state.initialRotation
        }
    }, [ state?.initialRotation ])

    useEffect(() => {
        if (state == null) {
            return () => {}
        }

        // every rapierWorld?.timestep
        const interval = setInterval(() => {
            // if space is pressed, apply force
            if (spacebarPressedRef.current) {
                const force = {
                    x: 0,
                    y: -2.675
                }

                const rotation = state.rocket.rotation()

                const rotatedForce = {
                    x: force.x * Math.cos(rotation) - force.y * Math.sin(rotation),
                    y: force.x * Math.sin(rotation) + force.y * Math.cos(rotation)
                }

                state.rocket.applyImpulse(rotatedForce, true)
            }

            state.rocket.setRotation(rotation.current, true)

            state.rapierWorld.step()
            update(useGameStore.getState())
        }, state.rapierWorld.timestep)

        return () => {
            clearInterval(interval)
        }
    }, [ state ])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                spacebarPressedRef.current = true
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                spacebarPressedRef.current = false
            }
        }

        let referencePoint = 0
        let referenceRotation = 0
        let isMouseDown = false

        const onMouseDown = (e: PIXI.InteractionEvent) => {
            referencePoint = e.data.global.x
            referenceRotation = rotation.current
            isMouseDown = true

            console.log(`referencePoint: ${referencePoint}, referenceRotation: ${referenceRotation}`)
        }

        const onMouseMove = (e: PIXI.InteractionEvent) => {
            if (!isMouseDown) {
                return
            }

            const delta = e.data.global.x - referencePoint
            rotation.current = referenceRotation + delta / 200
   
            console.log(rotation.current)
        }

        const onMouseUp = (e: PIXI.InteractionEvent) => {
            isMouseDown = false
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        app.renderer.plugins.interaction.on("pointerdown", onMouseDown)
        app.renderer.plugins.interaction.on("pointermove", onMouseMove)
        app.renderer.plugins.interaction.on("pointerup", onMouseUp)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            app.renderer.plugins.interaction.off("pointerdown", onMouseDown)
            app.renderer.plugins.interaction.off("pointermove", onMouseMove)
            app.renderer.plugins.interaction.off("pointerup", onMouseUp)
        }
    }, [ spacebarPressedRef, rotation ])

    return (
        <>
        </>
    )
}