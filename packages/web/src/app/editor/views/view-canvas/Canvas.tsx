import { OrthographicCamera } from "@react-three/drei"
import { Canvas as RawCanvas } from "@react-three/fiber"
import { Entities } from "../../entities/Entities"
import { Pipeline } from "./pipeline/Pipeline"

export function Canvas() {
    return (
        <RawCanvas frameloop="demand">
            <Pipeline />
            <Entities />
            <OrthographicCamera position={[0, 0, 100]} makeDefault manual zoom={50} />
        </RawCanvas>
    )
}
