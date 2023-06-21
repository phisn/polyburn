import { Svg } from "@react-three/drei"
import { Suspense, useState } from "react"
import { EntityModelType } from "runtime/src/model/world/EntityModelType"
import { Entity } from "runtime-framework"
import { Euler } from "three"

import { entityModels } from "../../../model/world/EntityModels"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { WebappComponents } from "../webapp-runtime/WebappComponents"

export function FlagGraphic(props: { entity: Entity<WebappComponents> }) {
    if (!props.entity.has("level")) {
        throw new Error("Got invalid entity graphic type level")
    }

    console.log("flag graphic")

    const [unlocked, setUnlocked] = useState(false)

    const entry = unlocked
        ? entityModels[EntityModelType.GreenFlag]
        : entityModels[EntityModelType.RedFlag]

    useGraphicUpdate(() => {
        if (!props.entity.has("level")) {
            throw new Error("Got invalid entity graphic type level")
        }

        const showUnlocked = props.entity.components.level.captured

        if (showUnlocked !== unlocked) {
            console.log("flag graphic update to " + showUnlocked + " from " + unlocked)
            setUnlocked(showUnlocked)
        }
    })

    return (
        <>
            {
                !props.entity.components.level.hideFlag &&
                <Suspense>
                    <Svg src={entry.src} scale={entry.scale} 
                        position={[
                            props.entity.components.level.flag.x,
                            props.entity.components.level.flag.y,
                            0 
                        ]}
                        rotation={new Euler(0, 0, props.entity.components.level.flagRotation)}
                    />
                </Suspense>
            }
        </>
    )
}