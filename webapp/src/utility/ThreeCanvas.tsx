import { Geometry } from "pixi.js"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrthographicCamera, Scene } from "three"
import { UseBoundStore, StoreApi, create } from "zustand"
import { shallow } from "zustand/shallow"
import useEditorStore from "../editor/EditorStore"
import { WorldCanvas } from "../editor/WorldCanvas"

interface Test {
    n: number

    geometry: THREE.PlaneGeometry
    material: THREE.MeshBasicMaterial
    mesh: THREE.Mesh
}

interface TestStore {
    test?: Test
    
    three: THREE.WebGLRenderer
    camera: THREE.OrthographicCamera
    scene: THREE.Scene

    newTest: () => void
    increaseTest: (n: number) => void
}

const useTestStore = create<TestStore>((set) => ({
    three: new THREE.WebGLRenderer(),
    camera: new THREE.OrthographicCamera(),
    scene: new THREE.Scene(),

    newTest: () => set(state => {
        const geometry = new THREE.PlaneGeometry(100, 100)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

        const test = {
            n: 0,
            geometry,
            material,
            mesh: new THREE.Mesh(geometry, material).translateZ(-1)
        }

        state.scene.add(test.mesh)

        return {
            test
        }
    }),
    increaseTest: (n: number) => set((state) => {
        if (state.test) {
            state.test.mesh.position.x += n

            return {
                test: {
                    ...state.test,
                    n: state.test.n + n
                }
            }
        }
        
        return {}
    })
}))

export function ThreeTest() {
    useEffect(() => {
        useTestStore.getState().newTest()
    }, [])

    useEffect(() => useTestStore.subscribe((state) => {
        state.three.render(state.scene, state.camera)
    }), [])

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute">
                <h1>Three.js Test</h1>
                <button className="btn" onClick={() => {
                    useTestStore.getState().increaseTest(100)
                }}>
                    Increase
                </button>

                <button className="btn" onClick={() => {
                    useTestStore.getState().increaseTest(-100)
                }}>
                    Decrease
                </button>
            </div>

            <ThreeCanvas
                renderer={useTestStore.getState().three}
                camera={useTestStore.getState().camera}
                onRender={() => {
                    console.log("render")
                    const state = useTestStore.getState()
                    state.three.render(state.scene, state.camera)
                }} />
        </div>
    )
}

interface ThreeCanvasStore {
    three: THREE.WebGLRenderer
    camera?: THREE.OrthographicCamera
}

interface ThreeCanvasProps<T extends ThreeCanvasStore> {
    renderer: THREE.WebGLRenderer
    camera?: THREE.OrthographicCamera

    onRender?: () => void
    onSizeChange?: (width: number, height: number) => boolean | void
}

function ThreeCanvas<T extends ThreeCanvasStore>(props: ThreeCanvasProps<T>) {
    const canvasToReplace = "canvas-id"
    console.log(`rendering ${canvasToReplace}`)

    useEffect(() => {
        const element = document.getElementById(canvasToReplace)

        if (!element) {
            throw new Error(`Could not find element with id ${canvasToReplace}`)
        }

        if (element !== props.renderer.domElement) {
            element.replaceWith(props.renderer.domElement)
            
            props.renderer.domElement.id = canvasToReplace
            props.renderer.domElement.className = "block w-screen h-screen"
        }

    }, [props.renderer, props.camera])

    useEffect(() => {
        const onResize = (canvas: HTMLCanvasElement) => () => {
            props.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight

            if (props.onSizeChange) {
                props.onSizeChange(canvas.clientWidth, canvas.clientHeight)
            }

            if (props.camera) {
                props.camera.left = -canvas.clientWidth / 2
                props.camera.right = canvas.clientWidth / 2
                props.camera.top = canvas.clientHeight / 2
                props.camera.bottom = -canvas.clientHeight / 2

                props.camera.updateProjectionMatrix()

                console.log(`Resizing camera to ${canvas.clientWidth}x${canvas.clientHeight}`)
            }

            props.onRender?.()
        }

        // see https://stackoverflow.com/a/73831830
        const observer = new ResizeObserver(onResize(props.renderer.domElement))
        observer.observe(props.renderer.domElement)

        onResize(props.renderer.domElement)()

        return () => {
            observer.disconnect()
        }

    }, [props.onSizeChange, props.onRender, props.renderer, props.camera])

    return (
        <div id={canvasToReplace} />
    )
}
  
export default ThreeCanvas
