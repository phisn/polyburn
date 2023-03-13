import { OrthographicCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"

import { World } from "../model/world/World"
import { RuntimeWorld } from "./runtime/RuntimeWorld"
import { StaticGameWorld } from "./static/StaticGameWorld"

export interface GameProps {
    world: World
}

export function Game(props: GameProps) {
    return (
        <div className="h-screen w-screen">
            <Canvas style={{ background: "#000000" }} >
                <OrthographicCamera
                    makeDefault
                    position={[0, 0, 10]}
                    rotation={[0, 0, 0]}
                />

                <StaticGameWorld world={props.world} />
                <Suspense>
                    <RuntimeWorld world={props.world} />
                </Suspense>

                {/* <Stats /> */}
            </Canvas>

            <div className="absolute top-0 left-0 p-4">
            </div>
        </div>
    )
}

export default Game
