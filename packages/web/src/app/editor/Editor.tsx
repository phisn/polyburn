import { Canvas } from "@react-three/fiber"
import { Fragment } from "react"
import { EntityType } from "runtime/proto/world"
import { Vector2 } from "three"
import { EventHandler } from "./EventHandler"
import { editorTunnel } from "./Tunnel"
import { Camera } from "./components/Camera"
import { PrimaryBar } from "./components/PrimaryBar"
import { Background } from "./components/background/Background"
import { GamemodeSelect } from "./components/gamemode/GamemodeSelect"
import { Level } from "./entities/level/Level"
import { Rocket } from "./entities/rocket/Rocket"
import { Shape } from "./entities/shape/Shape"
import { EntityState } from "./models/EntityState"
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
                            type: EntityType.SHAPE,
                            id: 1,
                            position: { x: 0, y: 0 },
                            vertices: [
                                {
                                    position: new Vector2(0, 0),
                                    color: 0xff0000,
                                },
                                {
                                    position: new Vector2(5, 0),
                                    color: 0x00ff00,
                                },
                                {
                                    position: new Vector2(5, 5),
                                    color: 0x0000ff,
                                },
                                {
                                    position: new Vector2(0, 5),
                                    color: 0xff0000,
                                },
                            ],
                        },
                    ],
                    [
                        2,
                        {
                            type: EntityType.SHAPE,
                            id: 2,
                            position: { x: 0, y: 0 },
                            vertices: [
                                {
                                    position: new Vector2(5, 5),
                                    color: 0xff0000,
                                },
                                {
                                    position: new Vector2(10, 5),
                                    color: 0x00ff00,
                                },
                                {
                                    position: new Vector2(10, 10),
                                    color: 0x0000ff,
                                },
                                {
                                    position: new Vector2(5, 10),
                                    color: 0xff0000,
                                },
                            ],
                        },
                    ],
                    [
                        3,
                        {
                            type: EntityType.ROCKET,
                            id: 3,

                            position: { x: -2, y: 0 },
                            rotation: 0,

                            defaultConfig: undefined,
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
    const gamemode = useEditorStore(store => store.gamemode)?.groups ?? []

    return (
        <>
            {[...entities.entries()].filter(filterEntitiesInGamemode).map(([id, entity]) => (
                <Fragment key={id}>
                    {entity.type === EntityType.SHAPE && <Shape state={entity} />}
                    {entity.type === EntityType.ROCKET && <Rocket state={entity} />}
                    {entity.type === EntityType.LEVEL && <Level state={entity} />}
                </Fragment>
            ))}
        </>
    )

    function filterEntitiesInGamemode([, entity]: [number, EntityState]) {
        return entity.group === undefined || gamemode.includes(entity.group)
    }
}
