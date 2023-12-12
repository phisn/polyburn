import { Canvas as RawCanvas } from "@react-three/fiber"
import { Entities } from "../../entities/Entities"
import { Camera } from "./Camera"
import { Pipeline } from "./pipeline/Pipeline"

export function Canvas() {
    return (
        <RawCanvas frameloop="demand">
            <Pipeline />
            <Entities />
            <Camera />
        </RawCanvas>
    )
}
