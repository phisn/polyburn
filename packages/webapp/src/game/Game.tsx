import { Canvas, useThree } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import tunnel from "tunnel-rat"

import { useLandscape } from "../common/hooks/useLandscape"
import { WorldModel } from "../model/world/WorldModel"
import Camera from "./components/Camera"
import Level from "./components/Level"
import Overlay from "./components/overlay/Overlay"
import { Rocket } from "./components/Rocket"
import { Shape } from "./components/Shape"
import { useRuntimeRunner } from "./hooks/useRuntimeRunner"
import { CommonGamemode } from "./runtime/gamemode/CommonGamemode"
import { Runtime } from "./runtime/Runtime"
import { RuntimeConfig } from "./runtime/RuntimeConfig"
import { ProvideGameStore, useGameStore } from "./store/useGameStore"

export interface GameProps {
    world: WorldModel
}

const overlay = tunnel()

function Game(props: GameProps) {
    const config: RuntimeConfig = {
        enableParticles: true,
    }

    const runtimeRef = useRef<Runtime>(new Runtime(
        config, 
        props.world, 
        new CommonGamemode()
    ))

    return (
        <ProvideGameStore runtime={runtimeRef.current}>
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
        </ProvideGameStore>
    )
}

function InnerGame(props: GameProps) {
    const runtime = useGameStore(state => state.runtime)

    useLandscape()
    useRuntimeRunner()

    const camera = useThree(state => state.camera) as THREE.OrthographicCamera

    return (
        <>
            <overlay.In>
                <Overlay camera={camera} />
            </overlay.In>
            
            <Camera />

            {
                props.world.shapes.map((shape, index) =>
                    <Shape key={index} vertices={shape.vertices} />
                )
            }

            {
                <Rocket rocket={runtime.state.rocket} />
            }

            {
                runtime.state.levels.map((level, index) =>
                    <Level key={index} level={level} rocket={runtime.state.rocket} />
                )
            }

            {/* <Stats /> */}
        </>
    )
}

export default Game
