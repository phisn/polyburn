import { Svg } from "@react-three/drei"
import { Suspense, useState } from "react"
import { LevelEntity, LevelEntityComponents } from "runtime/src/core/level/level-entity"
import { Euler } from "three"
import { withEntityStore } from "../../../common/runtime-framework/WithEntityStore"
import { useGraphicUpdate } from "../ViewUpdates"
import { entityGraphicRegistry } from "../graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../graphics-assets/entity-graphic-type"

function FlagGraphic(props: { entity: LevelEntity }) {
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
            props.entity.components.level.captured || props.entity.components.level.inCapture

        if (showUnlocked !== unlocked) {
            setUnlocked(showUnlocked)
        }
    })

    return (
        <>
            {!props.entity.components.level.hideFlag && (
                <Suspense>
                    <Svg
                        src={entry.src}
                        scale={entry.scale}
                        position={[
                            props.entity.components.level.flag.x,
                            props.entity.components.level.flag.y,
                            0,
                        ]}
                        rotation={new Euler(0, 0, props.entity.components.level.flagRotation)}
                    />
                    {/*
                    <mesh
                        position={[
                            props.entity.components.level.captureCollider.translation().x,
                            props.entity.components.level.captureCollider.translation().y,
                            1,
                        ]}
                        rotation={[0, 0, 0]}
                    >
                        <planeGeometry args={[10, 0.05]} />
                        <meshBasicMaterial color={"red"} />
                    </mesh>
                    */}
                </Suspense>
            )}
        </>
    )
}

export const FlagGraphics = withEntityStore(FlagGraphic, ...LevelEntityComponents)
