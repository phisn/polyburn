import { Svg } from "@react-three/drei"
import { Suspense, useState } from "react"
import { Euler } from "three"

import { entityModels } from "../../model/world/EntityModels"
import { EntityType } from "../../model/world/EntityType"
import { RuntimeLevel } from "../runtime/domain/common/RuntimeLevel"
import { RuntimeRocket } from "../runtime/domain/rocket/RuntimeRocket"

function Level(props: { rocket: RuntimeRocket, level: RuntimeLevel }) {
    const [unlocked, setUnlocked] = useState(false)

    const entry = unlocked
        ? entityModels[EntityType.GreenFlag]
        : entityModels[EntityType.RedFlag]

    /*
    useFrame(() => {
        const showUnlocked = props || 
            props.rocket.currentLevelCapture === props.level

        if (showUnlocked !== unlocked) {
            setUnlocked(showUnlocked)
        }
    })
    */

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
