import { Geometry } from "pixi.js"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrthographicCamera, Scene } from "three"
import { UseBoundStore, StoreApi, create } from "zustand"

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

export function ThreeTest() {
    const [width, setWidth] = useState<number>(window.innerWidth)
    const [height, setHeight] = useState<number>(window.innerHeight)

    const boxRef = useRef<THREE.PlaneGeometry>()
    const sceneRef = useRef<THREE.Scene>(new Scene())
    const cameraRef = useRef<THREE.OrthographicCamera>(new OrthographicCamera())

    const updateCamera = (width: number, height: number) => {
        if (cameraRef.current) {
            console.log("updating camera")
            console.log(`width: ${width}, height: ${height}`)

            const camera = cameraRef.current
            camera.left = -width / 2
            camera.right = width / 2
            camera.top = height / 2
            camera.bottom = -height / 2
            camera.updateProjectionMatrix()
        }
    }

    useEffect(() => {
        const box = new THREE.PlaneGeometry(100, 100)
        boxRef.current = box

        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
        const cube = new THREE.Mesh(box, material)

        cube.position.set(0, 0, -1)

        sceneRef.current.add(cube)

        updateCamera(width, height)

    }, [])

    useEffect(() => {
        const resize = () => {
            console.log(`resizing to ${window.innerWidth}x${window.innerHeight}`)

            setWidth(window.innerWidth)
            setHeight(window.innerHeight)

            updateCamera(window.innerWidth, window.innerHeight)

            useTestStore.getState().increaseTest()
        }

        window.addEventListener("resize", resize)

        return () => {
            window.removeEventListener("resize", resize)
        }
    }, [updateCamera])

    return (
        <div className="overflow-hidden">
            <div className="absolute">
                <h1>Three.js Test</h1>
            </div>
            <ThreeZustandRenderer 
                width={width}
                height={height}
                store={useTestStore} 
                handler={(state) => {
                    console.log(`left: ${cameraRef.current.left}`)
                    return [ sceneRef.current, cameraRef.current ]
                }}
            />
        </div>
    )
}



interface ThreeZustandRendererProps<T> {
    width: number
    height: number
    store: UseBoundStore<StoreApi<T>>
    handler: (t: T) => [ THREE.Scene?, THREE.Camera? ]
}

function ThreeZustandRenderer<T>(props: ThreeZustandRendererProps<T>) {
    const sceneRenderer = useCallback((renderer: THREE.Renderer) => {
        const handler = (state: T) => {
            const [ scene, camera ] = props.handler(state)

            if (!scene || !camera) {
                console.log("No scene or camera")
                return
            }

            console.log("Rendering")

            renderer.render(scene, camera)
        }

        handler(props.store.getState())
        return props.store.subscribe(handler)
    }, [ props.handler ])

    return (
        <ThreeCanvas
            width={props.width}
            height={props.height}
            sceneRenderer={sceneRenderer} />
    )
}

interface ThreeWorldProps {
    scene: THREE.Scene
    camera: THREE.Camera

    width: number
    height: number
}

function ThreeWorld(props: ThreeWorldProps) {
    const sceneRenderer = useCallback((renderer: THREE.Renderer) => {
        const handler = (state: T) => {
            const [ scene, camera ] = props.handler(state)

            if (!scene || !camera) {
                console.log("No scene or camera")
                return
            }

            console.log("Rendering")

            renderer.render(scene, camera)
        }

        handler(props.store.getState())
        return props.store.subscribe(handler)
        
    }, [ props.camera, props.scene ])

    return (
        <ThreeCanvas
            width={props.width}
            height={props.height}
            sceneRenderer={sceneRenderer} />
    )
}

interface ThreeCanvasEvent<T> {
    width: number
    height: number

    state: T
    scene: THREE.Scene
    camera: THREE.Camera
}

interface ThreeCanvasProps<T> {
    store: UseBoundStore<StoreApi<T>>
    handler: (state: T, scene: THREE.Scene, camera: THREE.Camera) => void    

    width: number
    height: number
}

function ThreeCanvas<T>(props: ThreeCanvasProps<T>) {
    const threeRef = useRef<THREE.WebGLRenderer>(new THREE.WebGLRenderer({ antialias: true }))
    const sceneRef = useRef<THREE.Scene>(new THREE.Scene())
    const cameraRef = useRef<THREE.OrthographicCamera>(new THREE.OrthographicCamera())

    useEffect(() => {
        const three = document.getElementById("three")
        
        if (!three) {
            console.error("Could not find element with id 'three'")
            return
        }

        three.replaceWith(threeRef.current.domElement)
        threeRef.current.setSize(props.width, props.height)

        const process = (state: T) => {
            props.handler(state, sceneRef.current, cameraRef.current)
            threeRef.current.render(sceneRef.current, cameraRef.current)
        }

        process(props.store.getState())
        return props.store.subscribe(process)

    }, [])

    useEffect(() => {
        if (!threeRef.current) {
            return
        }

        threeRef.current.setSize(
            Math.ceil(props.width - 1), 
            Math.ceil(props.height - 1)
        )

        cameraRef.current.left = -props.width / 2
        cameraRef.current.right = props.width / 2
        cameraRef.current.top = props.height / 2
        cameraRef.current.bottom = -props.height / 2

        cameraRef.current.updateProjectionMatrix()

    }, [ props.width, props.height ])

    return (
        <div id="three" />
    )
}
  
export default ThreeZustandRenderer
