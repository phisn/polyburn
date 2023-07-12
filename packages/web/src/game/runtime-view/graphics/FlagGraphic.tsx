import { Svg } from "@react-three/drei"
import { Suspense, useState } from "react"
import { Entity } from "runtime-framework"
import { LevelEntityComponents } from "runtime/src/core/level/LevelEntity"
import { Euler } from "three"

import { entityGraphicRegistry } from "../../../common/graphic/EntityGraphicRegistry"
import { EntityGraphicType } from "../../../common/graphic/EntityGraphicType"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { WebappComponents } from "../webapp-runtime/WebappComponents"

export function FlagGraphic(props: { entity: Entity<WebappComponents> }) {
    if (!props.entity.has(...LevelEntityComponents)) {
        throw new Error("Got invalid entity graphic type")
    }

    const [unlocked, setUnlocked] = useState(false)

    const entry = unlocked
        ? entityGraphicRegistry[EntityGraphicType.GreenFlag]
        : entityGraphicRegistry[EntityGraphicType.RedFlag]

    useGraphicUpdate(() => {
        if (!props.entity.has("level")) {
            throw new Error("Got invalid entity graphic type level")
        }

        const showUnlocked =
            props.entity.components.level.captured ||
            props.entity.components.level.inCapture

        if (showUnlocked !== unlocked) {
            setUnlocked(showUnlocked)
        }
    })

    return (
        <>
            {!props.entity.components.level.hideFlag && (
                <Suspense>
                    <Svg
                        src={entry.src as string}
                        scale={entry.scale as number}
                        position={[
                            props.entity.components.level.flag.x,
                            props.entity.components.level.flag.y,
                            0,
                        ]}
                        rotation={
                            new Euler(
                                0,
                                0,
                                props.entity.components.level.flagRotation,
                            )
                        }
                    />
                </Suspense>
            )}
        </>
    )
}
