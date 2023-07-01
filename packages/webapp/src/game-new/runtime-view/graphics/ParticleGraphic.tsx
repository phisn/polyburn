import { useRef } from "react"
import { Entity } from "runtime-framework"

import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { colorInGradient, gradientColorToNumber } from "../webapp-runtime/particle/Gradient"
import { WebappComponents } from "../webapp-runtime/WebappComponents"

export function ParticleGraphic(props: { entity: Entity<WebappComponents> }) {
    if (!props.entity.has("particle")) {
        throw new Error("Got invalid entity graphic type")
    }

    const particle = props.entity

    const currentGradientColor = () => gradientColorToNumber(colorInGradient(
        particle.components.particle.gradientOverTime,
        particle.components.particle.age / particle.components.particle.lifeTime
    ))

    const previousAgeRef = useRef(0)
    const meshRef = useRef<THREE.Mesh>(null!)
    const materialRef = useRef<THREE.MeshBasicMaterial>(null!)

    useGraphicUpdate(() => {
        if (!particle.has("interpolation")) {
            console.error("Entity is missing interpolation component")
            return
        }

        meshRef.current.position.set(
            particle.components.interpolation.position.x,
            particle.components.interpolation.position.y,
            0)

        if (previousAgeRef.current !== particle.components.particle.age) {
            materialRef.current.color.set(currentGradientColor())

            materialRef.current.needsUpdate = true
            previousAgeRef.current = particle.components.particle.age
        }
    })

    return (
        <>
            <mesh ref={meshRef}>
                <planeGeometry args={[
                    // dividing by 1.414 = sqrt(2) to get the diagonal of the square to 
                    // fit the square inside the circle
                    props.entity.components.particle.size / 1.414,
                    props.entity.components.particle.size / 1.414
                ]
                } />

                <meshBasicMaterial ref={materialRef} color={currentGradientColor()} opacity={0.8} transparent />
            </mesh>
        </>
    )
}
