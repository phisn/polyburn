import { useMemo } from "react"
import { Path, Shape as ThreeShape } from "three" 

import { EntityType, FlagEntity } from "../../model/world/Entity"
import { editorModeTunnel } from "../Editor"
import { useEditorStore } from "../editor-store/useEditorStore"
import { Entity } from "./components/Entity"
import { EntityPreview } from "./components/EntityPreview"
import { MousePointerHint } from "./components/MousePointerHint"
import { Shape } from "./components/Shape"
import EventDispatcher from "./event/EventDispatcher"
import SideBar from "./SideBar"



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
                world.shapes.map((_, i) => <Shape key={i} shapeIndex={i} /> )
            }
        </>
    )
}

function LevelCamera(props: { entity: FlagEntity }) {
    // stroke only rectangle defined by
    // props.entity.cameraBottomRight
    // props.entity.cameraTopLeft

    const shape = useMemo(() => {
        const size = {
            x: props.entity.cameraBottomRight.x - props.entity.cameraTopLeft.x,
            y: props.entity.cameraBottomRight.y - props.entity.cameraTopLeft.y
        }

        const width = 0.1

        const shape = new ThreeShape()
            .moveTo(0, 0)
            .lineTo(size.x, 0)
            .lineTo(size.x, size.y)
            .lineTo(0, size.y)
            .lineTo(0, 0)

        const inner = new Path()
            .moveTo(width, width)
            .lineTo(size.x - width, width)
            .lineTo(size.x - width, size.y - width)
            .lineTo(width, size.y - width)
            .lineTo(width, width)

        shape.holes.push(inner)

        return shape
    }, [props.entity.cameraBottomRight, props.entity.cameraTopLeft])

    return (
        <>
            <mesh position={[
                props.entity.cameraTopLeft.x,
                props.entity.cameraTopLeft.y,
                4
            ]}>
                <shapeBufferGeometry args={[shape]} />
                <meshBasicMaterial color="red" />

            </mesh>
        </>
    )
}

function LevelCameras() {
    const entities = useEditorStore(state => state.world.entities)

    const cameras = entities.filter(
        entity => entity.type === EntityType.RedFlag) as FlagEntity[]

    return (
        <>
            {
                cameras.map((camera, i) => <LevelCamera key={i} entity={camera} />)
            }
        </>
    )
}

function PlacementMode() {
    return (
        <>
            <EventDispatcher />
            <MousePointerHint /> 

            <Entities />
            <EntityPreview />
            <Shapes />

            <LevelCameras />

            <editorModeTunnel.In>
                <SideBar />
            </editorModeTunnel.In>
        </>
    )
}

export default PlacementMode
