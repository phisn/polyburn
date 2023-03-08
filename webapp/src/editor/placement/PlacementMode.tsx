import { Canvas, render, useFrame, useLoader, useThree } from "@react-three/fiber"
import { OrthographicCamera, Stats, Svg } from "@react-three/drei"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three"
import { Point } from "../world/Point";
import { findClosestEdge, findClosestVertex, Shape as WorldShape } from "../world/Shape";
import { useEditorStore } from "../editor-store/useEditorStore";
import { buildCanvasToWorld, editorModeTunnel } from "../Editor";
import { highlightColor, highlightDeleteColor, highlightVertexColor, snapDistance } from "../Values";
import { insertShape, insertVertex } from "../world/World";
import { HintType } from "./state/Hint";
import EventListener from "./event/EventListener";
import { ActionType } from "./state/Action";
import PlacableObjectSelector from "./EntityTypeSelection";
import { Entity as EntityModel, EntityType } from "../world/Entity";
import SideBar from "./SideBar";
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { entities, entityRect } from "../world/Entities";
import { changeAnchor } from "../../utility/math";
import { Euler } from "three";
import { scale } from "../world/Size";

function Vertex(props: { vertex: Point }) {
    return (
        <mesh position={[props.vertex.x, props.vertex.y, 0]} >
            <circleGeometry args={[5.0]} />
            <meshBasicMaterial color="#222228" />
            
            <mesh>
                <circleGeometry args={[4.0]} />
                <meshBasicMaterial color="#C8DB35" />
            </mesh>
        </mesh>
    )
}

function Shape(props: { shape: WorldShape, shapeIndex: number }) {
    const action = useEditorStore(state => state.modeState.action)

    let vertices = props.shape.vertices

    switch (action?.type) {
        case ActionType.MoveVertex:
            if (action.shapeIndex === props.shapeIndex) {
                vertices = vertices.map((vertex, i) =>
                    i === action.vertexIndex ? action.point : vertex
                )
            }

            break
        case ActionType.InsertVertex:
            if (action.shapeIndex === props.shapeIndex) {
                vertices = [
                    ...vertices.slice(0, action.vertexAfterIndex + 1),
                    action.point,
                    ...vertices.slice(action.vertexAfterIndex + 1)
                ]
            }

            break
    }

    if (action?.type === ActionType.MoveVertex && action.shapeIndex === props.shapeIndex) {
        console.log(`Action.point: ${action.point.x}, ${action.point.y}`)
        vertices = vertices.map((vertex, i) => 
            i === action.vertexIndex ? action.point : vertex
        )
    }

    const threeShape = new THREE.Shape(
        vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
    )

    return (
        <>
            <mesh>
                <shapeGeometry args={[threeShape]} />
                <meshBasicMaterial color={"#DC5249"} />
            </mesh>
            
            { 
                vertices.map((vertex, i) => <Vertex key={i} vertex={vertex} /> ) 
            }
        </>
    )
}

function MousePointerHint() {
    const hint = useEditorStore(state => state.modeState.hint)

    const hintPoint = useMemo(() => {
        switch (hint?.type) {
            case HintType.Vertex:
                return {
                    color: hint.delete ? highlightDeleteColor : highlightVertexColor,
                    point: hint.point
                }

            case HintType.Edge:
                return {
                    color: highlightColor,
                    point: hint.point
                }

            default:
                return null
        }

    }, [hint])

    return (
        <>
            { hintPoint &&
                <mesh position={[hintPoint.point.x, hintPoint.point.y, 0.5]}>
                    <circleGeometry args={[5.0]} />
                    <meshBasicMaterial color={hintPoint.color} />
                </mesh>
            }
        </>
    )
}

function Entity(props: { entity: EntityModel, index?: number }) {
    const entry = entities[props.entity.type]

    const { topLeft, topRight, bottomLeft, bottomRight } = useMemo(
        () => entityRect(props.entity), 
        [props.entity]
    )

    const hint = useEditorStore(state => state.modeState.hint)

    const isHighlighted = props.index !== undefined
        && hint?.type === HintType.Entity 
        && hint.entityIndex === props.index

    const isToDelete = isHighlighted && hint.delete

    const strokeMaterial = useMemo(() => {
        if (isToDelete) {
            return new THREE.MeshBasicMaterial({
                color: 0xff4444,
            })
        }

        if (isHighlighted) {
            return new THREE.MeshBasicMaterial({
                color: 0xffff44,
            })
        }

        return undefined

    }, [isHighlighted, isToDelete])

    return (
        <>
            <Suspense fallback={null}>
                { props.entity.position &&
                    <Svg
                        fillMaterial={strokeMaterial}
                        src={entry.src}
                        scale={entry.scale} 
                        position={[
                            props.entity.position.x,
                            props.entity.position.y,
                            0 ]} 
                        rotation={new Euler(0, 0, props.entity.rotation)} 
                    />
                }
            </Suspense>

            <mesh position={[topLeft.x, topLeft.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[topRight.x, topRight.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#55ff55" />
            </mesh>
            <mesh position={[bottomLeft.x, bottomLeft.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#5555ff" />
            </mesh>
            <mesh position={[bottomRight.x, bottomRight.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#ffff55" />
            </mesh>
        </>
    )
}

function EntityPreview() {
    const action = useEditorStore(state => state.modeState.action)

    return (
        <>
            { action?.type == ActionType.PlaceEntity &&
                <Entity entity={action.entity} />
            }
        </>
    )
}

function Entities() {
    const world = useEditorStore(state => state.world)

    return (
        <>
            {
                world.entities.map((entity, i) => <Entity key={i} entity={entity} index={i} /> )
            }
        </>
    )
}

function Shapes() {
    const world = useEditorStore(state => state.world)

    return (
        <>
            {
                world.shapes.map((shape, i) => <Shape key={i} shape={shape} shapeIndex={i} /> )
            }
        </>
    )
}

function PlacementMode() {
    return (
        <>
            <EventListener />
            <MousePointerHint /> 

            <Entities />
            <EntityPreview />
            <Shapes />

            <editorModeTunnel.In>
                <SideBar />
            </editorModeTunnel.In>
        </>
    )
}

export default PlacementMode
