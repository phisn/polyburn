import RAPIER from "@dimforge/rapier2d-compat"
import { PerformanceMonitor } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, use, useEffect } from "react"
import { isMobile } from "react-device-detect"
import { WorldModel } from "runtime/proto/world"
import tunnel from "tunnel-rat"
import "./Game.css"
import { useGameHook } from "./GameHook"
import Overlay from "./overlay/Overlay"
import { useWebappRuntime } from "./runtime-runner/useWebappRuntime"
import { RuntimeView } from "./runtime-view/RuntimeView"
import { newWebappRuntime } from "./runtime-view/webapp-runtime/WebappRuntime"
import { WebappSystemStack } from "./runtime-view/webapp-runtime/WebappSystemStack"
import { ProvideGameStore, useGameStore } from "./store/GameStore"

const rapierInit = RAPIER.init()
const overlay = tunnel()

function Game(props: { name: string; world: WorldModel; gamemode: string }) {
    use(rapierInit)

    /*
    const newAlert = useGlobalStore(state => state.newAlert)

    enum FullscreenState {
        None,
        Fullscreen,
        ErrorOrDenied,
    }

    const fullscrenStateRef = useRef<FullscreenState>(FullscreenState.None)
    */

    useEffect(() => {
        if (isMobile) {
            /*
            console.log("Mobile detected")

            const requestFullscreen = async () => {
                if (!document.fullscreenElement && document.fullscreenEnabled) {
                    await document.documentElement.requestFullscreen({
                        navigationUI: "hide",
                    })

                }
            }

            const requestOrientationLock = async () => {
                if ("orientation" in screen && "lock" in screen.orientation) {
                    await screen.orientation.lock("landscape-primary")
                }
            }

            const runner = async () => {
                await requestFullscreen()
                await requestOrientationLock()
            }

            runner().catch(e => {
                console.error(e)

                newAlert({
                    message: "Failed to enter fullscreen",
                    type: "error",
                })

                fullscrenStateRef.current = FullscreenState.ErrorOrDenied
            })

            screen.orientation.addEventListener("change", () => {})

            return () => {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                }

                if ("orientation" in screen && "unlock" in screen.orientation) {
                    screen.orientation.unlock()
                }
            }
            */
        }
    }, [])

    const stack = newWebappRuntime(props.name, props.world, props.gamemode)

    return (
        <ProvideGameStore systemContext={stack.factoryContext}>
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

function GameInThree(props: { stack: WebappSystemStack }) {
    useWebappRuntime(props.stack)

    const setPerformance = useGameStore(state => state.setPerformance)
    const gameHook = useGameHook()

    useEffect(() =>
        props.stack.factoryContext.messageStore.listenTo("finished", () => {
            gameHook?.finished?.(props.stack.factoryContext.replayCaptureService.replay)
        }),
    )

    return (
        <>
            <PerformanceMonitor onChange={api => setPerformance(api.factor)} />

            <overlay.In>
                <Overlay />
            </overlay.In>

            <RuntimeView />
        </>
    )
}

export default Game
