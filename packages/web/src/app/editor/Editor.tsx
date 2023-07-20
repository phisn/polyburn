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
    const circle = []

    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2

        circle.push(new Vector2(Math.cos(angle) * 8, Math.sin(angle) * 8))
    }

    const star = []

    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2

        const radius = i % 2 === 0 ? 8 : 4

        star.push(
            new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius),
        )
    }

    const uglyStar = []

    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2

        const radius = i % 2 === 0 ? 4 : 2

        uglyStar.push(
            new Vector2(
                Math.cos(angle) * radius * (1 + Math.random() * 1),
                Math.sin(angle) * radius * (1 + Math.random() * 1),
            ),
        )
    }

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
                },

                {
                    type: EntityType.Shape,
                    id: 3,
                    position: new Vector3(0, 0),
                    vertices: uglyStar,
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
