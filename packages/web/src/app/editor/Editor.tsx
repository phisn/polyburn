import { Canvas } from "@react-three/fiber"
import { EntityType } from "runtime/src/core/common/EntityType"
import { Vector2, Vector3 } from "three"
import { EventHandler } from "./EventHandler"
import { editorTunnel } from "./Tunnel"
import { Camera } from "./components/Camera"
import { Level } from "./entities/Level"
import { Rocket } from "./entities/Rocket"
import { Shape } from "./entities/shape/Shape"
import { ProvideEntityStore, useEntities } from "./store/EntityStore"
import { ProvideEventStore } from "./store/EventStore"

export function Editor() {
    return (
        <ProvideEntityStore
            entities={[
                {
                    type: EntityType.Shape,
                    id: 1,
                    position: new Vector3(0, 0),
                    vertices: [
                        new Vector2(0, 0),
                        new Vector2(5, 0),
                        new Vector2(5, 5),
                        new Vector2(0, 5),
                    ],
                    colors: [0xff0000, 0x00ff00, 0x0000ff, 0xff0000],
                },
                {
                    type: EntityType.Shape,
                    id: 2,
                    position: new Vector3(0, 0),
                    vertices: [
                        new Vector2(5, 5),
                        new Vector2(10, 5),
                        new Vector2(10, 10),
                        new Vector2(5, 10),
                    ],
                    colors: [0xff0000, 0x00ff00, 0x0000ff, 0xff0000],
                },
            ]}
        >
            <ProvideEventStore>
                <div className="relative h-full w-full">
                    <Canvas className="">
                        <Camera />

                        <Entities />
                        <EventHandler />
                    </Canvas>

                    <editorTunnel.Out />
                </div>
            </ProvideEventStore>
        </ProvideEntityStore>
    )
}

function Entities() {
    const entities = useEntities()

    return (
        <>
            {[...entities.entries()].map(([id, entity]) => (
                <>
                    {entity.type === EntityType.Shape && (
                        <Shape key={id} id={id} />
                    )}

                    {entity.type === EntityType.Rocket && <Rocket key={id} />}
                    {entity.type === EntityType.Level && <Level key={id} />}
                </>
            ))}
        </>
    )
}
