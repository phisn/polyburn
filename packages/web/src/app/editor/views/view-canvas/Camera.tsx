import { OrthographicCamera } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import { useEditorStore } from "../../store/store"

export function Camera() {
    const zoomTarget = useEditorStore(state => state.zoomTarget)
    const zoomTargetOrientation = useEditorStore(state => state.zoomTargetOrientation)

    const invalidate = useThree(({ invalidate }) => invalidate)

    useFrame(({ camera, size }, delta) => {
        if (camera.zoom === zoomTarget) {
            return
        }

        let newZoom = camera.zoom + (zoomTarget - camera.zoom) * delta * 15

        if (Math.abs(newZoom - zoomTarget) < 0.1) {
            newZoom = zoomTarget
        } else {
            invalidate()
        }

        const canvasCenter = {
            x: size.width * 0.5,
            y: size.height * 0.5,
        }

        const position = new Vector3(
            zoomTargetOrientation.inWorld.x +
                (canvasCenter.x - zoomTargetOrientation.inWindow.x) / newZoom,
            zoomTargetOrientation.inWorld.y -
                (canvasCenter.y - zoomTargetOrientation.inWindow.y) / newZoom,
            camera.position.z,
        )

        camera.position.set(position.x, position.y, camera.position.z)
        camera.zoom = newZoom

        camera.updateProjectionMatrix()
    })

    return <OrthographicCamera position={[0, 0, 100]} makeDefault manual zoom={50} />
}
