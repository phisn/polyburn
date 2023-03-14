import { useFrame } from "@react-three/fiber"
import { forwardRef } from "react"
import { useRef } from "react"
import { Mesh } from "three"
import * as THREE from "three"

import { useEditorStore } from "../editor-store/useEditorStore"
import { ActionType } from "../placement/state/Action"
import { MutatableShapeGeometry } from "./MutatableShapeGeometry"

const Vertex = forwardRef<Mesh>((_, ref) => (
    <mesh ref={ref}>
        <circleGeometry args={[5.0]} />
        <meshBasicMaterial color="#222228" />
        
        <mesh>
            <circleGeometry args={[4.0]} />
            <meshBasicMaterial color="#C8DB35" />
        </mesh>
    </mesh>
))

// eslint: https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/display-name.md
Vertex.displayName = "Vertex"

export function Shape(props: { shapeIndex: number }) {
    const meshRef = useRef<Mesh>(null!)
    const verticesRef = useRef<(Mesh | null)[]>([])
    const newVertexRef = useRef<Mesh>(null!)

    const geometryRef = useRef<MutatableShapeGeometry>(
        new MutatableShapeGeometry()
    )

    const mutated = useRef(true)
    mutated.current = true

    useFrame(() => {
        const action = useEditorStore.getState().modeState.action

        if (action) {
            if (action.type === ActionType.InsertVertex ||
                action.type === ActionType.MoveVertex) {
                let vertices = useEditorStore.getState().world.shapes[props.shapeIndex].vertices
            
                geometryRef.current.update(
                    vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
                )
            
                verticesRef.current.forEach((vertexRef, i) => {
                    if (vertexRef) {
                        vertexRef.position.set(vertices[i].x, vertices[i].y, 0)
                    }
                })
                
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

                
                geometryRef.current.update(
                    vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
                )

                
                verticesRef.current.forEach((vertexRef, i) => {
                    if (vertexRef) {
                        vertexRef.position.set(vertices[i].x, vertices[i].y, 0)
                    }
                })

                if (verticesRef.current.length < vertices.length) {
                    newVertexRef.current.visible = true
                    newVertexRef.current.position.set(vertices[vertices.length - 1].x, vertices[vertices.length - 1].y, 0)
                }
                else {
                    newVertexRef.current.visible = false
                }

                mutated.current = true

                return
            }
        }

        if (mutated.current) {
            const vertices = useEditorStore.getState().world.shapes[props.shapeIndex].vertices

            geometryRef.current.update(
                vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
            )

            verticesRef.current.forEach((vertexRef, i) => {
                if (vertexRef) {
                    vertexRef.position.set(vertices[i].x, vertices[i].y, 0)
                }
            })

            newVertexRef.current.visible = false

            mutated.current = false
        }
    })

    const vertices = useEditorStore(state => state.world.shapes[props.shapeIndex].vertices)

    return (
        <>
            <mesh ref={meshRef} geometry={geometryRef.current}>
                <meshBasicMaterial color={"#DC5249"} />
            </mesh>
            
            {
                vertices.map((_, i) => 
                    <Vertex key={i}
                        ref={ref => verticesRef.current[i] = ref}
                    />
                ) 
            }

            <Vertex ref={newVertexRef} />
        </>
    )
}