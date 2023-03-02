import { useThree } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { buildCanvasToWorld } from "./Editor"
import { Mode } from "./editor-store/EditorStore"
import { HintType } from "./editor-store/PlacementState"
import { useEditorStore } from "./editor-store/useEditorStore"
import { highlightColor, highlightDeleteColor, highlightVertexColor, snapDistance } from "./Values"
import { findClosestEdge, findClosestVertex } from "./world/Shape"

function PlacmeentEditorMode() {
    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    const world = useEditorStore(state => state.world)
    const setModeState = useEditorStore(state => state.setModeState)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            const point = canvasToWorld(e.clientX, e.clientY)

            /*
            for (let i = world.entities.length - 1; i >= 0; i--) {
                const object = world.objects[i]
                
                if (isPointInsideObject(point, object)) {
                    if (ctrl) {
                        state.applyVisualMods({ 
                            highlightObjects: [ { index: i, color: highlightDeleteColor } ]
                        })
                    }
                    else {
                        state.applyVisualMods({ 
                            highlightObjects: [ { index: i, color: highlightObjectColor } ]
                        })
                    }
        
                    return
                }
            }
            */
        
            const vertex = findClosestVertex(world.shapes, point, snapDistance)
        
            if (vertex) {
                setModeState({
                    hint: {
                        type: HintType.Vertex,
                        position: vertex.point,
                        delete: e.ctrlKey
                    }
                })
        
                return
            }
        
            const edge = findClosestEdge(world.shapes, point, snapDistance)
        
            if (edge) {
                setModeState({
                    hint: {
                        type: HintType.Edge,
                        position: edge.point,
                        delete: e.ctrlKey
                    }
                })
        
                return
            }

            setModeState({
                hint: {
                    type: HintType.Space,
                    position: point,
                    delete: e.ctrlKey
                }
            })
        }

        canvas.addEventListener("pointermove", onPointerMove)

        return () => {
            canvas.removeEventListener("pointermove", onPointerMove)
        }
    })

    return <></>
}

function EditorMode() {
    const mode = useEditorStore(state => state.modeState.mode)

    return (
        <>
            { mode === Mode.Placement && <PlacmeentEditorMode /> }
        </>
    )
}

export default EditorMode
