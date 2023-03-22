import { OrthographicCamera } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"

import { baseZoom } from "../common/Values"
import { Point } from "../model/world/Point"
import { useInterpolation } from "./components/useInterpolation"
import { SimulationRocket } from "./simulation/createRocket"

function GameCamera(props: { rocket: SimulationRocket }) {
    const size = useThree(({ size }) => size)
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)
 
    useLayoutEffect(() => {
        cameraRef.current.updateProjectionMatrix()
    }, [size])

    useInterpolation(props.rocket.body, (point: Point) => {
        cameraRef.current.position.set(point.x, point.y, 10)
    })

    return (
        <OrthographicCamera 
            ref={cameraRef}
            makeDefault
            position={[0, 0, 10]}
            rotation={[0, 0, 0]}
        
            zoom={baseZoom}
        />
    )
}

export default GameCamera
