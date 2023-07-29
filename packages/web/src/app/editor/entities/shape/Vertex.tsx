import { Html } from "@react-three/drei"
import { MeshProps } from "@react-three/fiber"
import { forwardRef, useEffect, useState } from "react"
import { RgbColorPicker } from "react-colorful"
import { Mesh, Vector3 } from "three"
import { baseZoomFactor } from "../../../../common/Values"
import { MutatableShapeGeometry } from "./MutatableShapeGeometry"
import { ShapeState, colorToHex, hexToColor } from "./ShapeState"

export const Vertex = forwardRef<Mesh, MeshProps>(function Vertex(props, ref) {
    return (
        <mesh ref={ref} {...props}>
            <circleGeometry args={[5 * baseZoomFactor]} />
            <meshBasicMaterial color="#222228" />

            <mesh>
                <circleGeometry args={[4 * baseZoomFactor]} />
                <meshBasicMaterial color="#C8DB35" />
            </mesh>
        </mesh>
    )
})

export function VertexContext(props: {
    geometryRef: React.MutableRefObject<MutatableShapeGeometry>
    state: ShapeState
    vertexIndex: number
}) {
    const [color, setColor] = useState(props.state.vertices[props.vertexIndex].color)

    useEffect(() => {
        setColor(props.state.vertices[props.vertexIndex].color)
    }, [props.vertexIndex])

    useEffect(() => {
        props.state.vertices[props.vertexIndex].color = color
        props.geometryRef.current.update(props.state.vertices)
    }, [color])

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (event.ctrlKey) {
                switch (event.key) {
                    case "c":
                        navigator.clipboard.writeText(colorToHex(color))

                        break

                    case "v":
                        navigator.clipboard.readText().then(text => {
                            const trimmed = text.trim()

                            if (trimmed.length === 7 && trimmed.startsWith("#")) {
                                setColor(hexToColor(trimmed))
                            }
                        })

                        break
                }
            }
        }

        window.addEventListener("keydown", listener)

        return () => void window.removeEventListener("keydown", listener)
    }, [color])

    return (
        <>
            <Html
                as="div"
                position={
                    new Vector3(
                        props.state.vertices[props.vertexIndex].position.x + props.state.position.x,
                        props.state.vertices[props.vertexIndex].position.y + props.state.position.y,
                    )
                }
            >
                <RgbColorPicker
                    className="absolute pl-4 pt-4"
                    onContextMenu={e => e.preventDefault()}
                    color={color}
                    onChange={setColor}
                />
            </Html>
        </>
    )
}
