import { Stage, Graphics } from "@inlet/react-pixi"
import PIXI from "pixi.js"
import { useCallback, useEffect, useState } from "react"
import { useRef } from "react"

function Game() {
    return (
        <div className="overflow-hidden">
            <Stage width={window.innerWidth} height={window.innerHeight} options={ { resizeTo: window } }>
            </Stage>
        </div>
    )
}

export default Game
