import { useEffect, useMemo, useRef, useState } from "react"
import { useMessage } from "../../common/runtime-framework/use-message"
import { prepareReplay } from "../runtime-extension/replay/prepare/prepare-replay"
import { newReplay } from "../runtime-extension/replay/replay-factory"
import { WebappRuntimeProps, newWebappRuntime } from "../runtime-extension/webapp-runtime"
import { RuntimePlayer } from "../runtime-player/RuntimePlayer"
import { withCanvas } from "../runtime-player/WithCanvas"
import { useControls } from "./use-controls"

export const GamePlayer = withCanvas(function GamePlayer(props: {
    runtimeProps: WebappRuntimeProps
}) {
    // TODO: this should be done outside of the component
    const replayPrepared = useMemo(() => {
        if (props.runtimeProps.replay === undefined) {
            return undefined
        }

        return prepareReplay(
            props.runtimeProps.replay,
            props.runtimeProps.world,
            props.runtimeProps.gamemode,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [stack, setStack] = useState(newWebappRuntime(props.runtimeProps))
    const startedRef = useRef(false)

    // user should not have to restart the whole run when dying at the first
    // level. time is reset to 0
    useMessage(stack.factoryContext.messageStore, "rocketDeath", () => {
        if (
            stack.factoryContext.store
                .find("level")
                .filter(level => level.components.level.captured).length <= 1
        ) {
            setStack(newWebappRuntime(props.runtimeProps))
            startedRef.current = false
        }
    })

    useEffect(() => {
        if (replayPrepared !== undefined) {
            console.log("replay prepared")
            newReplay(stack.factoryContext, replayPrepared)
        }
    }, [stack, replayPrepared])

    const controls = useControls()

    function update() {
        if (startedRef.current === false) {
            if (controls.current.thrust) {
                startedRef.current = true
            } else {
                return
            }
        }

        if (controls.current.pause) {
            return
        }

        // important that we capture the rotation before we step. to ensure deterministic properties
        // we need to use the modified rotation in the next step
        const rotationAfterCapture = stack.factoryContext.replayCaptureService.captureFrame({
            thrust: controls.current.thrust,
            rotation: controls.current.rotation,
        })

        stack.step({
            thrust: controls.current.thrust,
            rotation: rotationAfterCapture,
        })
    }

    return <RuntimePlayer stack={stack} update={update} />
})

// early prototype of fullscren handling
/*
    const newAlert = useGlobalStore(state => state.newAlert)

    enum FullscreenState {
        None,
        Fullscreen,
        ErrorOrDenied,
    }

    const fullscrenStateRef = useRef<FullscreenState>(FullscreenState.None)
    */

//    useEffect(() => {
//        if (isMobile) {
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
//        }
//    }, [])
*/
