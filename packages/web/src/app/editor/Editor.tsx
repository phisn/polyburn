import { Canvas } from "@react-three/fiber"
import { EntityType } from "runtime/src/core/common/EntityType"
import { Vector2, Vector3 } from "three"
import { EventHandler } from "./EventHandler"
import { editorTunnel } from "./Tunnel"
import { Background } from "./components/Background"
import { Camera } from "./components/Camera"
import { GamemodeSelect } from "./components/GamemodeSelect"
import { PrimaryBar } from "./components/PrimaryBar"
import { Level } from "./entities/Level"
import { Rocket } from "./entities/Rocket"
import { Shape } from "./entities/shape/Shape"
import { ProvideEventStore } from "./store/EventStore"
import { ProvideWorldStore, useWorldStore } from "./store/WorldStore"

export function Editor() {
    return (
        <ProvideWorldStore
            default={{
                entities: new Map([
                    [
                        1,
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
                    ],
                    [
                        2,
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
                    ],
                ]),
                gamemodes: [],
            }}
        >
            <ProvideEventStore>
                <div className="relative h-full w-full">
                    <Canvas className="">
                        <Camera />

                        <Entities />
                        <EventHandler />

                        <Background />
                    </Canvas>

                    <editorTunnel.Out />

                    <PrimaryBar />
                    <GamemodeSelect />
                </div>
            </ProvideEventStore>
        </ProvideWorldStore>
    )
}

function Entities() {
    const entities = useWorldStore().entities

    return (
        <>
            {[...entities.entries()].map(([id, entity]) => (
                <>
                    {entity.type === EntityType.Shape && <Shape key={id} state={entity} />}

                    {entity.type === EntityType.Rocket && <Rocket key={id} />}
                    {entity.type === EntityType.Level && <Level key={id} />}
                </>
            ))}
        </>
    )
}
