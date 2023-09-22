import { OrthographicCamera } from "@react-three/drei"
import { createPortal, useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { WebappSystemStack } from "../runtime-extension/webapp-system-stack"
import { RuntimeView } from "../runtime-view/RuntimeView"
import { ViewUpdatesProvider } from "../runtime-view/ViewUpdates"
import { useRuntimeRunner as useRuntimeViewRunner } from "./use-runtime-view-runner"

export function RuntimePlayer(props: {
    children?: React.ReactNode
    update: () => void
    stack: WebappSystemStack
}) {
    const viewUpdates = useRuntimeViewRunner(props.stack.factoryContext.store, props.update)

    return (
        <>
            <Renderer>
                <ViewUpdatesProvider context={viewUpdates}>{props.children}</ViewUpdatesProvider>
            </Renderer>
            <ViewUpdatesProvider context={viewUpdates}>
                <RuntimeView store={props.stack.factoryContext.store} />
            </ViewUpdatesProvider>
        </>
    )
}

function Renderer(props: { children?: React.ReactNode }) {
    const subScene = useMemo(() => new THREE.Scene(), [])
    const camera = useRef<THREE.OrthographicCamera>(null!)

    useThree()

    useFrame(({ gl, camera, scene }) => {
        gl.autoClear = false
        gl.render(scene, camera)
        gl.render(subScene, camera)
    })

    return createPortal(
        <>
            <OrthographicCamera ref={camera} frustumCulled={false} />
            {props.children}
        </>,
        subScene,
    )
}
