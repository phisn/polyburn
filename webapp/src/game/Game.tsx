import { Stage, Graphics, useApp } from "@inlet/react-pixi"
import PIXI from "pixi.js"
import { useCallback, useEffect, useState } from "react"
import { useRef } from "react"

export function GameVisual() { 
   const app = useApp()
   
   
}

export function Game() {
    const [app, setApp] = useState<PIXI.Application>()

    return (
        <div className="overflow-hidden">
            {/* Prevent transition artifacts between editor and game with static black backround */}
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black -z-10" />
            <Stage 
                onMount={setApp}
                width={window.innerWidth}
                height={window.innerHeight} 
                options={ { resizeTo: window, antialias: true } } >

            </Stage>
        </div>
    )
}

export default Game
