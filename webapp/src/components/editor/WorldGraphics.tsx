import { Graphics, Sprite, useApp } from "@inlet/react-pixi"
import * as PIXI from "pixi.js"
import { useCallback, useEffect, useRef, useState } from "react"
import { shallow } from "zustand/shallow"
import useEditorStore, { VisualWorldMods } from "./EditorStore"
import { EditorModeType } from "./EditorStore"

function WorldGraphics() {
    const app = useApp()

    // worldmodsref is a ref to the current worldmods. we store it in a ref and do *not* get it from useEditorStore to avoid
    // rendering WorldGraphics when worldmods changes. This is because worldmods changes *very very* frequently and pixi only
    // needs some value changes in the callbacks to update the graphics.
    const worldModsRef = useRef<VisualWorldMods>()
    const spriteRef = useRef<PIXI.Sprite | undefined>()
    const graphicsRef = useRef<PIXI.Graphics | undefined>()

    useEffect(() => useEditorStore.subscribe((state) => {
        if (state.worldMods.previewObject) {
            if (spriteRef.current === undefined) {
                const { src, position, rotation } = state.worldMods.previewObject

                const sprite = PIXI.Sprite.from(src)
                sprite.anchor.set(0.5)
                sprite.scale.set(0.2)
                sprite.position.set(position.x, position.y)
                sprite.rotation = rotation

                app.stage.addChild(sprite)
                spriteRef.current = sprite
            }
            else {
                const { src, position, rotation } = state.worldMods.previewObject

                spriteRef.current.texture = PIXI.Texture.from(src)
                spriteRef.current.position.set(position.x, position.y)
                spriteRef.current.rotation = rotation
            }
        }
        else {
            if (spriteRef.current) {
                spriteRef.current.destroy()
                spriteRef.current = undefined
            }
        }

        const draw = (g: PIXI.Graphics) => {
            g.clear()

            for (const [i, shape] of state.world.shapes.entries()) {
                const newShape = state.worldMods.replaceShapeAt?.index === i 
                    ? state.worldMods.replaceShapeAt.shape 
                    : shape

                g.lineStyle(0)
                g.beginFill(0xbb3333)
                g.drawPolygon(newShape.vertices)
                g.endFill()
            }

            if (state.mode === EditorModeType.Placement) {
                for (const [i, shape] of state.world.shapes.entries()) {
                    const newShape = state.worldMods.replaceShapeAt?.index === i 
                        ? state.worldMods.replaceShapeAt.shape 
                        : shape

                    for (const [j, vertex] of newShape.vertices.entries()) {
                        g.lineStyle(2, 0x000000)
                        g.beginFill(0xcccccc)
                        g.drawCircle(vertex.x, vertex.y, 5)
                        g.endFill()
                    }
                }
            }

            state.worldMods.highlightVertices?.forEach((toHighlight) => {
                g.lineStyle(0)
                g.beginFill(toHighlight.color)
                g.drawCircle(toHighlight.vertex.x, toHighlight.vertex.y, 5)
                g.endFill()
            })
        }

        if (graphicsRef.current == undefined) {
            const graphics = new PIXI.Graphics()
            app.stage.addChild(graphics)
            graphicsRef.current = graphics
        }

        draw(graphicsRef.current)

    })), [ app ]
    

    useEffect(() => useEditorStore.subscribe(({ worldMods }) => {

        if (worldMods.previewObject) {
            if (spriteRef.current === undefined) {
                const { src, position, rotation } = worldMods.previewObject

                const sprite = PIXI.Sprite.from(src)
                sprite.anchor.set(0.5)
                sprite.scale.set(0.2)
                sprite.position.set(position.x, position.y)
                sprite.rotation = rotation

                app.stage.addChild(sprite)
                spriteRef.current = sprite
            }
            else {
                const { src, position, rotation } = worldMods.previewObject

                spriteRef.current.texture = PIXI.Texture.from(src)
                spriteRef.current.position.set(position.x, position.y)
                spriteRef.current.rotation = rotation
            }
        }
        else {
            if (spriteRef.current) {
                spriteRef.current.destroy()
                spriteRef.current = undefined
            }
        }

    })), [ app ]

    return (
        <>
        </>    
    )
}

export default WorldGraphics
