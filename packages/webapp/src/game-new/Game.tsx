import RAPIER from "@dimforge/rapier2d-compat"
import { Canvas, useThree } from "@react-three/fiber"
import { Suspense } from "react"
import { commonGamemode, newRuntime } from "runtime"
import tunnel from "tunnel-rat"

import { useLandscape } from "../common/hooks/useLandscape"
import { WorldModel } from "../model/world/WorldModel"

export interface GameProps {
    world: WorldModel
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapierInit = RAPIER.init()

const overlay = tunnel()


function Game(props: GameProps) {
    const world = JSON.parse(JSON.stringify(props.world)) // dirty hack to prototype for now. fix later
    const runtime = newRuntime(commonGamemode, world)

    runtime.getState().step(0)

    return (
        <div className="h-screen w-screen select-none" style={{
            touchAction: "none", 
            userSelect: "none",

            // Prevent canvas selection on ios
            // https://github.com/playcanvas/editor/issues/160
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "rgba(255,255,255,0)",
        }}>
            <Canvas style={{ 
                background: "#000000",
                touchAction: "none", 
                userSelect: "none",
    
                // Prevent canvas selection on ios
                // https://github.com/playcanvas/editor/issues/160
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "rgba(255,255,255,0)",
            }} >
                <Suspense>
                    <InnerGame {...props} />
                </Suspense>
            </Canvas>
        
            <overlay.Out />
        </div>
    )
}

function InnerGame(props: GameProps) {
    useLandscape()
    useRuntimeRunner()

    const camera = useThree(state => state.camera) as THREE.OrthographicCamera

    return (
        <>
            <overlay.In>
            </overlay.In>
            
            <Camera />
            
        </>
    )
}

export default Game
