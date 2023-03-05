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
import { entities } from "../world/Entities";

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

function Entity(props: { entity: EntityModel }) {
    const entry = entities[props.entity.type]

    console.log(`entry: ${entry.src}`)

    return (
        <>
            <Suspense fallback={null}>
                <Svg 
                    src={entry.src}
                    scale={entry.scale} 
                    position={[props.entity.position.x, props.entity.position.y, 0]} />
            </Suspense>
        </>
    )
}

function EntityPreview() {
    const action = useEditorStore(state => state.modeState.action)

    console.log(`action: ${action?.type == ActionType.PlaceEntity && action.entity}`)

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
                world.entities.map((entity, i) => <Entity key={i} entity={entity} /> )
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
