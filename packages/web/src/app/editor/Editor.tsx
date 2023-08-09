import { Canvas } from "@react-three/fiber"
import { EntityType } from "runtime/src/core/common/EntityType"
import { Vector2, Vector3 } from "three"
import { EventHandler } from "./EventHandler"
import { editorTunnel } from "./Tunnel"
import { Camera } from "./components/Camera"
import { PrimaryBar } from "./components/PrimaryBar"
import { Background } from "./components/background/Background"
import { GamemodeSelect } from "./components/gamemode/GamemodeSelect"
import { Level } from "./entities/level/Level"
import { Rocket } from "./entities/rocket/Rocket"
import { Shape } from "./entities/shape/Shape"
import { ProvideWorldStore, useEditorStore } from "./store/EditorStore"
import { ProvideEventStore } from "./store/EventStore"

export function Editor() {
    return (
        <ProvideWorldStore
            world={{
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
                    [
                        3,
                        {
                            type: EntityType.Rocket,
                            id: 3,

                            position: new Vector3(-2, 0),
                            rotation: 0,
                        },
                    ],
                ]),
                gamemodes: [
                    {
                        name: "Normal",
                        groups: ["Normal Shapes", "Normal Flags", "Normal Spawn"],
                    },
                    {
                        name: "Reverse",
                        groups: ["Normal Shapes", "Reverse Flags", "Reverse Spawn"],
                    },
                    {
                        name: "Hard",
                        groups: ["Normal Shapes", "Hard Flags", "Normal Spawn"],
                    },
                ],
            }}
        >
            <ProvideEventStore>
                <div className="relative h-max w-full grow">
                    <div className="absolute bottom-0 left-0 right-0 top-0">
                        <Canvas className="" style={{}}>
                            <Camera />

                            <Entities />
                            <EventHandler />

                            <Background />
                        </Canvas>
                    </div>

                    <editorTunnel.Out />

                    <PrimaryBar />
                    <GamemodeSelect />
                </div>
            </ProvideEventStore>
        </ProvideWorldStore>
    )
}

function Entities() {
    const entities = useEditorStore(store => store.state).world.entities

    console.log("render entities")

    return (
        <>
            {[...entities.entries()].map(([id, entity]) => (
                <>
                    {entity.type === EntityType.Shape && <Shape key={id} state={entity} />}
                    {entity.type === EntityType.Rocket && <Rocket key={id} state={entity} />}
                    {entity.type === EntityType.Level && <Level key={id} state={entity} />}
                </>
            ))}
        </>
    )
}
