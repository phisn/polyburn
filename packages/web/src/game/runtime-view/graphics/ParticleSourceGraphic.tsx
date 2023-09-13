import { useLayoutEffect, useRef } from "react"
import { EntityWith } from "runtime-framework"
import * as THREE from "three"

import { WebappComponents } from "../../runtime-webapp/WebappComponents"
import { colorInGradient } from "../../runtime-webapp/particle/Gradient"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { withEntityStore } from "./withEntityStore"

export function ParticleSourceGraphic(props: {
    entity: EntityWith<WebappComponents, "particleSource">
}) {
    const entity = props.entity

    const instanceMeshRef = useRef<THREE.InstancedMesh>(null!)

    const instanceMatrix = new THREE.Matrix4()
    const instanceColor = new THREE.Color()

    useGraphicUpdate(ticked => {
        if (ticked === false) {
            return
        }

        const particleSource = entity.components.particleSource

        instanceMeshRef.current.count = particleSource.amount

        let i = 0
        let j = particleSource.latestParticle

        while (i < particleSource.amount) {
            const particle = particleSource.particles[j]

            if (particle !== undefined) {
                const position = particle.body.translation()

                instanceMeshRef.current.setMatrixAt(
                    i,
                    instanceMatrix
                        .makeScale(particle.size, particle.size, 1)
                        .setPosition(position.x, position.y, 1),
                )

                const color = colorInGradient(
                    particle.gradientOverTime,
                    particle.age / particle.lifeTime,
                )

                instanceMeshRef.current.setColorAt(
                    i,
                    instanceColor.setRGB(color[0], color[1], color[2], "srgb"),
                )

                i++
            }

            j = (j - 1 + particleSource.particles.length) % particleSource.particles.length
        }

        instanceMeshRef.current.instanceMatrix.needsUpdate = true

        if (instanceMeshRef.current.instanceColor && ticked) {
            instanceMeshRef.current.instanceColor.needsUpdate = true
        }
    })

    useLayoutEffect(() => {
        instanceMeshRef.current.setColorAt(0, new THREE.Color(0xffffff))

        // frustumCulled must be set to false or else particles may sometimes not be rendered
        // because three.js somehow can not detect correctly that they are in the frustum
        instanceMeshRef.current.frustumCulled = false
    }, [])

    return (
        <>
            <instancedMesh
                ref={instanceMeshRef}
                args={[undefined, undefined, entity.components.particleSource.bufferAmount]}
            >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial opacity={0.8} transparent />
            </instancedMesh>
        </>

        /*
        <mesh position={new THREE.Vector3(-18, 40, 0)}>
            <planeGeometry args={[5, 5]} />
            <meshBasicMaterial color={"white"} />
        </mesh>
        */
    )
}

export const ParticleSourceGraphics = withEntityStore(ParticleSourceGraphic, "particleSource")
