import { Stage, Graphics } from "@inlet/react-pixi"
import { useCallback, useEffect, useState } from "react"

function Game() {
    const [ position, setPosition ] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setTimeout(() => {
                setPosition({ x: e.clientX, y: e.clientY })
            }, 100)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const draw = useCallback((g) => {
        g.clear()
        g.beginFill(0xff0000)
        g.drawCircle(position.x, position.y, 10)
        g.endFill()
    }, [ position ])

    return (
        <div className="overflow-hidden">
            <Stage width={window.innerWidth} height={window.innerHeight} options={ { resizeTo: window } }>
                <Graphics draw={draw} />
            </Stage>
        </div>
    )
}

export default Game
