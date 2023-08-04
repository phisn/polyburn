"use client"

import RAPIER from "@dimforge/rapier2d-compat"
import { PerformanceMonitor } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { Suspense, use } from "react"
import { RuntimeSystemStack } from "runtime/src/core/RuntimeSystemStack"
import tunnel from "tunnel-rat"

import { WorldModel } from "runtime/src/model/world/WorldModel"
import { normalGamemode } from "../../../runtime/src/gamemode/NormalGamemode"
import Overlay from "./overlay/Overlay"
import { useWebappRuntime } from "./runtime-runner/useWebappRuntime"
import { RuntimeView } from "./runtime-view/RuntimeView"
import { newWebappRuntime } from "./runtime-view/webapp-runtime/WebappRuntime"
import { ProvideGameStore, useGameStore } from "./store/GameStore"

const rapierInit = RAPIER.init()
const overlay = tunnel()

function Game(props: { world: WorldModel }) {
    use(rapierInit)

    const world = JSON.parse(JSON.stringify(props.world)) // dirty hack to prototype for now. fix later
    const { context, stack } = newWebappRuntime(normalGamemode, world)

    return (
        <ProvideGameStore systemContext={context}>
            <div
                className="h-full select-none"
                style={{
                    msTouchAction: "manipulation",
                    touchAction: "none",
                    userSelect: "none",

                    // Prevent canvas selection on ios
                    // https://github.com/playcanvas/editor/issues/160
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    WebkitTapHighlightColor: "rgba(255,255,255,0)",
                }}
            >
                <Canvas
                    style={{
                        msTouchAction: "manipulation",
                        background: "#000000",
                        touchAction: "none",
                        userSelect: "none",

                        // Prevent canvas selection on ios
                        // https://github.com/playcanvas/editor/issues/160
                        WebkitTouchCallout: "none",
                        WebkitUserSelect: "none",
                        WebkitTapHighlightColor: "rgba(255,255,255,0)",
                    }}
                    /*
                    onClick={async e => {
                        const target = e.target as HTMLCanvasElement

                        if (document.pointerLockElement !== target) {
                            target.requestPointerLock()
                        }
                    }}
                    */
                >
                    <Suspense>
                        <GameInThree stack={stack} />
                    </Suspense>
                </Canvas>

                <overlay.Out />
            </div>
        </ProvideGameStore>
    )
}

function GameInThree(props: { stack: RuntimeSystemStack }) {
    useWebappRuntime(props.stack)

    const camera = useThree(state => state.camera) as THREE.OrthographicCamera

    const setPerformance = useGameStore(state => state.setPerformance)

    return (
        <>
            <PerformanceMonitor onChange={api => setPerformance(api.factor)} />

            <overlay.In>
                <Overlay camera={camera} />
            </overlay.In>

            <RuntimeView />
        </>
    )
}

export default Game
