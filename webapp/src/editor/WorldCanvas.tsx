import { Graphics, Sprite, useApp } from "@inlet/react-pixi"
import * as PIXI from "pixi.js"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { shallow } from "zustand/shallow"
import ThreeCanvas from "../utility/ThreeCanvas"
import useEditorStore, { EditorStore, useEditorEditorStore, VisualWorldMods } from "./EditorStore"
import { EditingModeType } from "./EditorStore"

export function WorldCanvas() {
    const [renderer, camera] = useEditorEditorStore(
        (state) => [state.rendering.renderer, state.rendering.camera],
        shallow
    )

    useEffect(() => useEditorEditorStore.subscribe((state) => {
        console.log(state.rendering.scene.children.length)
        state.rendering.renderer.render(state.rendering.scene, state.rendering.camera)
    }))

    return (
        <div>
            <ThreeCanvas
                renderer={renderer}
                camera={camera}
                onSizeChange={(w, h) => 
                    useEditorEditorStore.setState(store => ({
                        rendering: {
                            ...store.rendering,
                            canvasSize: {
                                width: w,
                                height: h
                            }
                        }
                    }))
                }
            />
        </div>
    )
}

function WorldGraphics() {
    const app = useApp()

    const objectSpritesRef = useRef<PIXI.Sprite[]>([])
    const previewSpriteRef = useRef<PIXI.Sprite | undefined>()
    const graphicsRef = useRef<PIXI.Graphics | undefined>()

    useEffect(() => useEditorStore.subscribe((state) => {
        if (state.worldMods.previewObject) {
            if (previewSpriteRef.current === undefined) {
                const sprite = new PIXI.Sprite()
                app.stage.addChild(sprite)
                previewSpriteRef.current = sprite
            }
            
            const { position, rotation, placeable, customAnchor } = state.worldMods.previewObject

            const anchor = customAnchor ?? placeable.anchor

            previewSpriteRef.current.texture = PIXI.Texture.from(placeable.src)
            previewSpriteRef.current.anchor.set(anchor.x, anchor.y)
            previewSpriteRef.current.position.set(position.x, position.y)
            previewSpriteRef.current.rotation = rotation
            previewSpriteRef.current.scale.set(placeable.scale)
        }
        else {
            if (previewSpriteRef.current) {
                previewSpriteRef.current.destroy()
                previewSpriteRef.current = undefined
            }
        }

        if (state.world.objects?.length > objectSpritesRef.current.length) {
            for (let i = objectSpritesRef.current.length; i < state.world.objects.length; i++) {
                const sprite = new PIXI.Sprite()
                sprite.filters = [new PIXI.filters.ColorMatrixFilter()]
                app.stage.addChild(sprite)
                objectSpritesRef.current.push(sprite)
            }
        }
        else if (state.world.objects?.length < objectSpritesRef.current.length) {
            for (let i = objectSpritesRef.current.length - 1; i >= state.world.objects.length; i--) {
                objectSpritesRef.current[i].destroy()
                objectSpritesRef.current.pop()
            }
        }

        for (let i = 0; i < state.world.objects?.length; i++) {
            const { placeable, position, rotation } = state.world.objects[i]

            objectSpritesRef.current[i].texture = PIXI.Texture.from(placeable.src)
            objectSpritesRef.current[i].anchor.set(placeable.anchor.x, placeable.anchor.y)
            objectSpritesRef.current[i].position.set(position.x, position.y)
            objectSpritesRef.current[i].rotation = rotation
            objectSpritesRef.current[i].scale.set(placeable.scale)

            const filter = objectSpritesRef.current[i].filters?.[0]
            const highlight = state.worldMods.highlightObjects?.find((o) => o.index === i)

            if (highlight) {
                if (filter instanceof PIXI.filters.ColorMatrixFilter) {
                    filter.brightness(2, false)
                    filter.tint(highlight?.color ?? 0, true)
                }
            }
            else {
                if (filter instanceof PIXI.filters.ColorMatrixFilter) {
                    filter.reset()
                }
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

            if (state.editingMode === EditingModeType.Placement) {
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

    return (
        <>
        </>    
    )
}

export default WorldGraphics
