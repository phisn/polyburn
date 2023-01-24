import { Graphics } from "@inlet/react-pixi"
import { useCallback } from "react"
import PIXI from "pixi.js"
import { World } from "./World"

interface GraphicsWorldProps {
    world: World

    noRenderShapes?: boolean
}

function WorldGraphics({ world, noRenderShapes }: GraphicsWorldProps) {
    const draw = useCallback((g: PIXI.Graphics) => {
        g.clear()

        world.shapes.forEach((shape) => {
            if (!noRenderShapes) {
                g.lineStyle(0)
                g.beginFill(0xbb3333)
                g.drawPolygon(shape.vertices)
                g.endFill()

                g.lineStyle(2, 0x000000)
                g.beginFill(0xcccccc)
                shape.vertices.forEach((vertex) => {
                    g.drawCircle(vertex.x, vertex.y, 5)
                })
            }
        })

    }, [ world ])

    return (
        <Graphics draw={draw} />
    )
}

export default WorldGraphics
