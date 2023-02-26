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
    increaseTest: () => void
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
    increaseTest: () => set((state) => {
        if (state.test) {
            state.test.mesh.position.x += 1

            return {
                test: {
                    ...state.test,
                    n: state.test.n + 1
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
                    useTestStore.getState().increaseTest()
                }}>
                    Increase
                </button>
            </div>

            <ThreeCanvas
                store={useTestStore}
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
    store: UseBoundStore<StoreApi<T>>

    onRender?: () => void
    onSizeChange?: (width: number, height: number) => void
}

function ThreeCanvas<T extends ThreeCanvasStore>(props: ThreeCanvasProps<T>) {
    const canvasToReplace = "canvas-id"
    const [three, camera] = props.store((state) => [state.three, state.camera], shallow)
    
    console.log(`three: ${three}, camera: ${camera}`)

    useEffect(() => {
        const element = document.getElementById(canvasToReplace)

        if (!element) {
            throw new Error(`Could not find element with id ${canvasToReplace}`)
        }

        if (element !== three.domElement) {
            element.replaceWith(three.domElement)
            
            three.domElement.id = canvasToReplace
            three.domElement.className = "block w-screen h-screen"
        }

    }, [three, camera])

    useEffect(() => {
        const onResize = (canvas: HTMLCanvasElement) => () => {
            three.setSize(canvas.clientWidth, canvas.clientHeight, false)

            console.log(`Resizing to ${canvas.clientWidth}x${canvas.clientHeight}`)

            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight

            if (props.onSizeChange) {
                props.onSizeChange(canvas.clientWidth, canvas.clientHeight)
            }
            else if (camera) {
                camera.left = -canvas.clientWidth / 2
                camera.right = canvas.clientWidth / 2
                camera.top = canvas.clientHeight / 2
                camera.bottom = -canvas.clientHeight / 2

                camera.updateProjectionMatrix()
            }

            props.onRender?.()
        }

        // see https://stackoverflow.com/a/73831830
        const observer = new ResizeObserver(onResize(three.domElement))
        observer.observe(three.domElement)

        onResize(three.domElement)()

        return () => {
            observer.disconnect()
        }

    }, [])

    return (
        <div id={canvasToReplace} />
    )
}
  
export default ThreeCanvas
