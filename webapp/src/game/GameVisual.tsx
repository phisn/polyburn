import { useApp, useTick } from "@inlet/react-pixi"
import { useCallback, useEffect, useRef, useState } from "react"
import useGameStore, { GameState, GameStore } from "./GameStore"
import * as PIXI from "pixi.js"
import RAPIER from "@dimforge/rapier2d-compat"
import { changeAnchor } from "../utility/math"
import sin from "@stdlib/math/base/special/sin"
import cos from "@stdlib/math/base/special/cos"

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

            const {
                cast,
                ray,
                rayStart,
                rayTarget
            } = store.state.rocketGroundRayRaw()

            if (cast) {
                g.lineStyle(2, 0xff0000)
                g.moveTo(rayStart.x, rayStart.y)
                g.lineTo(rayTarget.x, rayTarget.y)

                const p = ray.pointAt(cast.toi)

                g.beginFill(0xff0000)
                g.drawCircle(p.x, p.y, 5)
                g.endFill()
            }
            else {
                g.lineStyle(2, 0x00ff00)
                g.moveTo(rayStart.x, rayStart.y)
                g.lineTo(rayTarget.x, rayTarget.y)
            }

            g.lineStyle(0) 
            g.beginFill(0x00ff00 )
            g.drawCircle(rayStart.x, rayStart.y, 5)
            g.endFill()
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

    const state = useGameStore(store => store.state)
    
    const spacebarPressedRef = useRef<boolean>(false)
    const rotation = useRef<number>(0)

    useEffect(() => {
        if (state != null) {
            rotation.current = state?.rocketObject.rotation
        }
    }, [ state?.rocketObject.rotation ])

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
                
                if (state.rocketGroundRay()) {
                    force.x *= 1.3
                    force.y *= 1.3
                }

                const rotation = state.rocket.rotation()

                const rotatedForce = {
                    x: force.x * cos(rotation) - force.y * sin(rotation),
                    y: force.x * sin(rotation) + force.y * cos(rotation)
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