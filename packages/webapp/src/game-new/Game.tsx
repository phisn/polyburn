import RAPIER from "@dimforge/rapier2d-compat"
import { OrthographicCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { commonGamemode } from "runtime/src/gamemode/CommonGamemode"
import tunnel from "tunnel-rat"

import { WorldModel } from "../model/world/WorldModel"
import { useWebappRuntime } from "./hooks/useWebappRuntime"
import EntityGraphics from "./runtime-view/graphics/EntityGraphics"

export interface GameProps {
    world: WorldModel
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapierInit = RAPIER.init()

const overlay = tunnel()

function Game(props: GameProps) {
    const world = JSON.parse(JSON.stringify(props.world)) // dirty hack to prototype for now. fix later

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
    const store = useWebappRuntime(commonGamemode, props.world)

    return (
        <>
            <OrthographicCamera zoom={2} />

            <overlay.In>
            </overlay.In>

            <EntityGraphics store={store} />
        </>
    )
}

export default Game
