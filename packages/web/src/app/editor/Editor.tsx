import { OrthographicCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useMemo } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { Level } from "./entities/Level"
import { Rocket } from "./entities/Rocket"
import { Shape } from "./entities/Shape"
import { EventHandler } from "./EventHandler"
import {
    createEditorStore,
    ProvideEditorStore,
    useEditorStore,
} from "./store/EditorStore"
import { editorTunnel } from "./Tunnel"

export function Editor() {
    const store = useMemo(() => createEditorStore(), [])

    return (
        <ProvideEditorStore store={store}>
            <div className="relative">
                <Canvas>
                    <OrthographicCamera />

                    <mesh>
                        <boxBufferGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="hotpink" />
                    </mesh>

                    <Entities />
                    <EventHandler />
                </Canvas>

                <editorTunnel.Out />
            </div>
        </ProvideEditorStore>
    )
}

function Entities() {
    const { entities } = useEditorStore()

    return (
        <>
            {entities.map(entity => (
                <>
                    {entity.type === EntityType.Shape && <Shape />}
                    {entity.type === EntityType.Rocket && <Rocket />}
                    {entity.type === EntityType.Level && <Level />}
                </>
            ))}
        </>
    )
}
