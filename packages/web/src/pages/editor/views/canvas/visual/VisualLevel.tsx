import { Svg } from "@react-three/drei"
import { Immutable } from "immer"
import { useMemo, useRef } from "react"
import { MeshBasicMaterial, Object3D } from "three"
import { highlightColor, selectHightlightColor, selectObjectColor } from "../../../constants"
import { useEditorStore } from "../../../store/store"
import { useEntityEvent } from "../../../store/store-events"
import { EditorFlag } from "../../../store/world"
import { entityGraphicRegistry } from "./graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "./graphics-assets/entity-graphic-type"
import { VisualLevelLines, VisualLevelLinesRef } from "./VisualLevelLines"

export function VisualLevel(props: { entityKey: string; entity: Immutable<EditorFlag> }) {
    const meshRef = useRef<Object3D>(null)
    const linesRef = useRef<VisualLevelLinesRef>(null)

    useEntityEvent(props.entityKey, "bounds", bounds => {
        if (bounds === undefined) {
            return
        }

        linesRef.current?.setBounds(bounds)
    })

    useEntityEvent(props.entityKey, "transform", transform => {
        if (transform === undefined) {
            return
        }

        meshRef.current?.position.set(transform.point.x, transform.point.y, 0.1)
        meshRef.current?.rotation.set(0, 0, transform.rotation)

        linesRef.current?.setPosition(transform.point)
    })

    const highlighted = useEditorStore(x => x.highlighted.has(props.entityKey))
    const highlightedLine = useEditorStore(x => (highlighted ? x.highlightLine : undefined))
    const selected = useEditorStore(x => x.selected.has(props.entityKey))

    const material = useMemo(() => {
        let material: MeshBasicMaterial | undefined

        if (highlighted && selected) {
            material = new MeshBasicMaterial({ color: selectHightlightColor })
        } else if (highlighted) {
            material = new MeshBasicMaterial({ color: highlightColor })
        } else if (selected) {
            material = new MeshBasicMaterial({ color: selectObjectColor })
        }
        return material
    }, [highlighted, selected])

    return (
        <>
            <object3D
                ref={meshRef}
                position={[
                    props.entity.transform?.point.x ?? 0,
                    props.entity.transform?.point.y ?? 0,
                    0.1,
                ]}
                rotation={[0, 0, props.entity.transform?.rotation ?? 0]}
            >
                <Svg
                    position={[-0.5 * graphicEntry.size.width, 0.5 * graphicEntry.size.height, 0]}
                    fillMaterial={material}
                    ref={meshRef}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                />
            </object3D>

            {highlightedLine === "all" && (
                <VisualLevelLines
                    ref={linesRef}
                    entity={props.entity}
                    color={LevelCameraDragColor}
                    priority={1}
                />
            )}
            {highlightedLine !== "all" && (
                <VisualLevelLines
                    ref={linesRef}
                    entity={props.entity}
                    color={
                        selected
                            ? LevelCameraSelectColor
                            : highlighted
                              ? LevelCameraHoverColor
                              : LevelCameraColor
                    }
                    colorCustom={highlightedLine && { [highlightedLine]: LevelCameraDragColor }}
                    priority={1}
                />
            )}
        </>
    )
}

export const LevelCameraColor = "#FF7E2E"
export const LevelCameraHoverColor = "#9326FF"
export const LevelCameraSelectColor = "#CE19FE"
export const LevelCameraDragColor = "red"

const graphicEntry = entityGraphicRegistry[EntityGraphicType.RedFlag]
