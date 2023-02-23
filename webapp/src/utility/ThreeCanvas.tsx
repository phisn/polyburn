import { Geometry } from "pixi.js"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrthographicCamera, Scene } from "three"
import { UseBoundStore, StoreApi, create } from "zustand"
import useEditorStore from "../editor/EditorStore"
import { WorldCanvas } from "../editor/WorldCanvas"

interface TestStore {
    test: number
    setTest: (test: number) => void
    increaseTest: () => void
}

const useTestStore = create<TestStore>((set) => ({
    test: 0,
    setTest: (test: number) => set({ test }),
    increaseTest: () => set((state) => ({ test: state.test + 1 }))
}))

interface ThreeRefs {
    box: THREE.PlaneGeometry
}

export function ThreeTest() {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute">
                <h1>Three.js Test</h1>
                <button className="btn" onClick={() => {
                    useEditorStore.getState().test()
                }}>
                    Increase
                </button>
            </div>
            <WorldCanvas />
        </div>
    )
}

interface ThreeCanvasProps<T> {
    store: UseBoundStore<StoreApi<T>>

    onStoreChange: (state: T, camera: THREE.OrthographicCamera, scene: THREE.Scene) => void
    onSizeChange?: (width: number, height: number, camera: THREE.OrthographicCamera, scene: THREE.Scene) => void
}

interface ThreeCanvasRefs {
    three: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
}

function ThreeCanvas<T>(props: ThreeCanvasProps<T>) {
    const refs = useRef<ThreeCanvasRefs>()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        // sanity check
        if (!canvasRef.current) {
            throw new Error("Canvas ref is null")
        }

        // when using react debugging tools, useEffect can be called
        // multiple times when refs is already set. To prevent overriding
        // the refs, we check if it is already set
        if (refs.current) {
            return
        }

        refs.current = {
            three: new THREE.WebGLRenderer({
                canvas: canvasRef.current,
                antialias: true
            }),
            scene: new THREE.Scene(),
            camera: new THREE.OrthographicCamera()
        }

        const updateRendererWithState = (refs: ThreeCanvasRefs) => (state: T) => {
            props.onStoreChange(state, refs.camera, refs.scene)
            console.log("Rendering")
            refs.three.render(refs.scene, refs.camera)
        }

        updateRendererWithState(refs.current)(props.store.getState())
        return props.store.subscribe(updateRendererWithState(refs.current))

    }, [])

    useEffect(() => {
        if (!refs.current || !canvasRef.current) {
            throw new Error("Refs are null")
        }

        const onResize = (refs: ThreeCanvasRefs, canvas: HTMLCanvasElement) => () => {
            refs.three.setSize(canvas.clientWidth, canvas.clientHeight, false)

            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight

            if (props.onSizeChange) {
                props.onSizeChange(canvas.clientWidth, canvas.clientHeight, refs.camera, refs.scene)
            }
            else {
                refs.camera.left = -canvas.clientWidth / 2
                refs.camera.right = canvas.clientWidth / 2
                refs.camera.top = canvas.clientHeight / 2
                refs.camera.bottom = -canvas.clientHeight / 2

                refs.camera.updateProjectionMatrix()
                
                console.log("Resizing")
            }

            refs.three.render(refs.scene, refs.camera)
        }

        // see https://stackoverflow.com/a/73831830
        const observer = new ResizeObserver(onResize(refs.current, canvasRef.current))
        observer.observe(canvasRef.current)

        onResize(refs.current, canvasRef.current)()

        return () => {
            observer.disconnect()
        }

    }, [])

    // we reaaaly want to use our own canvas. the given canvas by threejs does not respond
    // to resize events correctly and also when resizing does not set the correct size resulting
    // in a scroll bar
    return (
        <canvas ref={canvasRef} className="display-block w-full h-full" />
    )
}
  
export default ThreeCanvas
