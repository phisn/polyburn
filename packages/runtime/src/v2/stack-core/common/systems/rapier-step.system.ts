import { EntityStore, EntityWith, System, SystemStack } from "runtime-framework"
import { CoreComponents } from "../../core-components"
import { CoreEvents } from "../../core-events"
import { WorldComponents } from "../../world/world-entity"

export class RapierStepSystem implements System<CoreEvents> {
    private world: EntityWith<CoreComponents, "rapier">

    constructor(entities: EntityStore<CoreComponents>, _systems: SystemStack<CoreEvents>) {
        this.world = entities.single(...WorldComponents)
    }

    onCoreUpdate() {
        this.world.rapier.world.step(this.world.rapier.queue)
    }
}
