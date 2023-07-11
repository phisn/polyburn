import { Entity, EntityStore, EntityWith } from "runtime-framework"

import { WebappComponents } from "../WebappComponents"
import { ParticleSourceComponent } from "./ParticleSource"

export const injectParticleSource = <T extends (keyof WebappComponents)[]>(
    store: EntityStore<WebappComponents>,
    particleSource: (
        entity: EntityWith<WebappComponents, T[number]>,
    ) => ParticleSourceComponent,
    ...components: [...T]
) => {
    store.listenTo(
        entity => {
            entity.components.particleSource = particleSource(
                entity as EntityWith<WebappComponents, T[number]>,
            )
        },
        entity => {
            delete (entity as Entity<WebappComponents>).components
                .particleSource
        },
        ...components,
    )
}
