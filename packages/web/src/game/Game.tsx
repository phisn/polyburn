import RAPIER from "@dimforge/rapier2d-compat"
import { PerformanceMonitor } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { Suspense, use } from "react"
import { WorldModel } from "runtime/proto/world"
import { RuntimeSystemStack } from "runtime/src/core/RuntimeSystemStack"
import tunnel from "tunnel-rat"
import Overlay from "./overlay/Overlay"
import { useWebappRuntime } from "./runtime-runner/useWebappRuntime"
import { RuntimeView } from "./runtime-view/RuntimeView"
import { newWebappRuntime } from "./runtime-view/webapp-runtime/WebappRuntime"
import { ProvideGameStore, useGameStore } from "./store/GameStore"

const rapierInit = RAPIER.init()
const overlay = tunnel()

function Game(props: { world: WorldModel; gamemode: string }) {
    use(rapierInit)

    const { context, stack } = newWebappRuntime(props.world, props.gamemode)

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
                    className=""
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
