import { Svg } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { Euler } from "three"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/EntityType"
import { LevelModel } from "../simulation/createLevel"

function Level(props: { level: LevelModel }) {
    const [unlocked, setUnlocked] = useState(false)

    const entry = unlocked
        ? entities[EntityType.GreenFlag]
        : entities[EntityType.RedFlag]

    useFrame(() => {
        if (props.level.unlocked !== unlocked) {
            setUnlocked(props.level.unlocked)
        }
    })

    return (
        <Suspense>
            <Svg src={entry.src} scale={entry.scale} 
                position={[
                    props.level.flag.x,
                    props.level.flag.y,
                    0 
                ]}
                rotation={new Euler(0, 0, props.level.flagRotation)}
            />
        </Suspense>
    )
}

export default Level
