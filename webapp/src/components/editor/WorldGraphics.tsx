import { Graphics } from "@inlet/react-pixi"
import PIXI from "pixi.js"
import { useCallback } from "react"
import useEditorStore from "./EditorStore"
import { EditorModeType } from "./EditorStore"

function WorldGraphics() {
    const [world, visualWorldMods, mode] = useEditorStore((s) => [s.world, s.worldMods, s.mode])

    const draw = (g: PIXI.Graphics) => {
        g.clear()

        world.shapes.forEach((shape, i) => {
            shape = visualWorldMods.replaceShapeAt?.index === i ? visualWorldMods.replaceShapeAt.shape : shape

            g.lineStyle(0)
            g.beginFill(0xbb3333)
            g.drawPolygon(shape.vertices)
            g.endFill()
        })

        if (mode === EditorModeType.Placement) {
            world.shapes.forEach((shape, i) => {
                shape = visualWorldMods.replaceShapeAt?.index === i ? visualWorldMods.replaceShapeAt.shape : shape

                shape.vertices.forEach((vertex) => {
                    g.lineStyle(2, 0x000000)
                    g.beginFill(0xcccccc)
                    g.drawCircle(vertex.x, vertex.y, 5)
                    g.endFill()
                })
            })
        }

        visualWorldMods.highlightVertices?.forEach((vertex) => {
            g.lineStyle(0)
            g.beginFill(0x00ff00)
            g.drawCircle(vertex.x, vertex.y, 5)
            g.endFill()
        })
    }

    return (
        <Graphics draw={draw} />
    )
}

export default WorldGraphics
