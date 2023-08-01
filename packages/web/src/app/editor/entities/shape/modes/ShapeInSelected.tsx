import { Html } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { Mesh, MeshBasicMaterial, Vector2, Vector3 } from "three"
import {
    baseZoomFactor,
    highlightColor,
    highlightDeleteColor,
    snapDistance,
} from "../../../../../common/Values"
import { ListTask } from "../../../../../common/components/inline-svg/ListTask"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { MutatableShapeGeometry } from "../MutatableShapeGeometry"
import { ShapeMode } from "../Shape"
import {
    ShapeState,
    ShapeVertexColor,
    averageColor,
    findClosestEdge,
    findClosestVertex,
    isPointInsideShape,
} from "../ShapeState"
import { Vertex, VertexContext } from "../Vertex"
import { shapeRemoveVertex } from "../mutations/shapeRemoveVertex"

export interface ShapeModeSelected {
    type: "selected"
}

export function ShapeInSelected(props: {
    state: ShapeState
    mode: ShapeModeSelected
    setMode: (mode: ShapeMode) => void
}) {
    const [showVertexDialog, setShowVertexDialog] = useState<undefined | { vertexIndex: number }>()
    const [showShapeDialog, setShowShapeDialog] = useState<undefined | { position: Point }>()

    const markerRef = useRef<Mesh>(null!)
    const markerMaterialRef = useRef<MeshBasicMaterial>(null!)

    const geometryRef = useRef<MutatableShapeGeometry>(new MutatableShapeGeometry())

    const dispatch = useEditorStore(store => store.mutation)

    useEffect(() => {
        geometryRef.current.update(props.state.vertices)
    })

    function showMarker(point: Point, color: string) {
        markerMaterialRef.current.color.set(color)
        markerRef.current.visible = true
        markerRef.current.position.set(point.x, point.y, Priority.Selected + 0.001)
    }

    function startVertexMode(
        vertexIndex: number,
        position: Point,
        color: ShapeVertexColor,
        insert: boolean,
    ) {
        const vector = new Vector2(
            position.x - props.state.position.x,
            position.y - props.state.position.y,
        )

        props.setMode({
            type: "vertex",
            vertexIndex,
            vertex: {
                position: vector,
                color,
            },
            insert,
        })
    }

    useEventListener(event => {
        if (showVertexDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
            setShowVertexDialog(undefined)
        }

        if (showShapeDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
            setShowShapeDialog(undefined)
        }

        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }

            return
        }

        // marker is invisible by default
        markerRef.current.visible = false

        const closestVertex = findClosestVertex(props.state, event.position, snapDistance)

        if (closestVertex) {
            if (event.ctrlKey) {
                window.document.body.style.cursor = "pointer"

                if (event.leftButtonClicked) {
                    console.log("remove vertex dispatch here")
                    dispatch(shapeRemoveVertex(props.state, closestVertex.vertexIndex))
                } else {
                    showMarker(closestVertex.point, highlightDeleteColor)
                }

                return ConsumeEvent
            }

            if (event.leftButtonClicked) {
                geometryRef.current.update(props.state.vertices)

                window.document.body.style.cursor = "grabbing"
                startVertexMode(
                    closestVertex.vertexIndex,
                    closestVertex.point,
                    props.state.vertices[closestVertex.vertexIndex].color,
                    false,
                )
            } else if (event.rightButtonClicked) {
                setShowVertexDialog({ vertexIndex: closestVertex.vertexIndex })
            } else {
                window.document.body.style.cursor = "grab"
                showMarker(closestVertex.point, highlightColor)
            }

            return ConsumeEvent
        }

        const closestEdge = findClosestEdge(props.state, event.position, snapDistance)

        if (closestEdge) {
            if (event.leftButtonClicked) {
                window.document.body.style.cursor = "grabbing"
                startVertexMode(
                    closestEdge.edge[1],
                    closestEdge.point,
                    averageColor(
                        props.state.vertices[closestEdge.edge[0]].color,
                        props.state.vertices[closestEdge.edge[1]].color,
                    ),
                    true,
                )
            } else if (!event.ctrlKey) {
                window.document.body.style.cursor = "pointer"
                showMarker(closestEdge.point, highlightColor)
            }

            return ConsumeEvent
        }

        const isPointInside = isPointInsideShape(event.position, props.state)

        if (isPointInside) {
            if (event.shiftKey) {
                if (event.leftButtonClicked) {
                    props.setMode({
                        type: "moving",
                        offsetPosition: {
                            x: props.state.position.x - event.positionInGrid.x,
                            y: props.state.position.y - event.positionInGrid.y,
                        },
                    })
                }

                window.document.body.style.cursor = "grab"
            }

            if (event.rightButtonClicked) {
                setShowShapeDialog({
                    position: {
                        x: props.state.position.x + event.positionInGrid.x + 0.1,
                        y: props.state.position.y + event.positionInGrid.y - 0.1,
                    },
                })
            }

            return ConsumeEvent
        } else if (event.leftButtonClicked) {
            props.setMode({ type: "none" })
        }
    }, Priority.Normal)

    return (
        <>
            <mesh
                frustumCulled={false}
                geometry={geometryRef.current}
                position={[props.state.position.x, props.state.position.y, Priority.Selected]}
            >
                <meshBasicMaterial vertexColors />
            </mesh>

            <mesh ref={markerRef} visible={false}>
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial ref={markerMaterialRef} />
            </mesh>

            {props.state.vertices.map((vertex, i) => (
                <Vertex
                    key={i}
                    position={[
                        vertex.position.x + props.state.position.x,
                        vertex.position.y + props.state.position.y,
                        Priority.Selected,
                    ]}
                />
            ))}

            {showVertexDialog && (
                <VertexContext
                    geometryRef={geometryRef}
                    state={props.state}
                    vertexIndex={showVertexDialog.vertexIndex}
                />
            )}

            {showShapeDialog && (
                <ShapeContext state={props.state} position={showShapeDialog.position} />
            )}
        </>
    )
}

function ShapeContext(props: { state: ShapeState; position: Point }) {
    const world = useEditorStore(store => store.state).world

    const groups = world.gamemodes
        .flatMap(gamemode => gamemode.groups)
        .filter((group, index, self) => self.indexOf(group) === index)

    return (
        <Html
            as="div"
            position={new Vector3(props.position.x, props.position.y, Priority.Selected + 0.01)}
        >
            <div className="rounded-2xl">
                <div className="join">
                    <div className="join-item bg-base-100 flex items-center bg-opacity-80 p-3 text-sm text-white backdrop-blur-2xl">
                        <ListTask width="20" height="20" />
                    </div>
                    {groups.length > 0 && (
                        <select className="join-item select bg-base-300 min-w-[10rem] bg-opacity-75 !outline-none backdrop-blur-2xl">
                            {groups.map(group => (
                                <option key={group}>{group}</option>
                            ))}
                        </select>
                    )}
                    {groups.length === 0 && (
                        <div className="join-item bg-base-300 text-error flex min-w-[18rem] items-center justify-center bg-opacity-75 text-center text-sm backdrop-blur-2xl">
                            Create new group in gamemode settings
                        </div>
                    )}
                </div>
            </div>
        </Html>
    )
}
