import { Canvas as RawCanvas } from "@react-three/fiber"
import { Entities } from "../../entities/Entities"
import { Camera } from "./Camera"
import { ContextMenuProxy } from "./ContextMenuProxy"
import { Pipeline } from "./pipeline/Pipeline"

export function Canvas() {
    return (
        <RawCanvas frameloop="demand">
            <Pipeline />
            <Entities />
            <Camera />
            <ContextMenuProxy />
        </RawCanvas>
    )
}
