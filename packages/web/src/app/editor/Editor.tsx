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
                        {
                            position: new Vector2(0, 0),
                            color: { r: 255, g: 0, b: 0 },
                        },
                        {
                            position: new Vector2(5, 0),
                            color: { r: 0, g: 255, b: 0 },
                        },
                        {
                            position: new Vector2(5, 5),
                            color: { r: 0, g: 0, b: 255 },
                        },
                        {
                            position: new Vector2(0, 5),
                            color: { r: 255, g: 0, b: 0 },
                        },
                    ],
                },
                {
                    type: EntityType.Shape,
                    id: 2,
                    position: new Vector3(0, 0),
                    vertices: [
                        {
                            position: new Vector2(5, 5),
                            color: { r: 255, g: 0, b: 0 },
                        },
                        {
                            position: new Vector2(10, 5),
                            color: { r: 0, g: 255, b: 0 },
                        },
                        {
                            position: new Vector2(10, 10),
                            color: { r: 0, g: 0, b: 255 },
                        },
                        {
                            position: new Vector2(5, 10),
                            color: { r: 255, g: 0, b: 0 },
                        },
                    ],
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
