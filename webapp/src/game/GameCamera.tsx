import { OrthographicCamera } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"

import { baseZoom } from "../common/Values"

function GameCamera() {
    const size = useThree(({ size }) => size)
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)
 
    useLayoutEffect(() => {
        cameraRef.current.updateProjectionMatrix()
    }, [size])



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
