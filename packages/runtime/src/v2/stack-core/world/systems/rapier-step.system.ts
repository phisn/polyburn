import { EntityStore, EntityWith, System } from "runtime-framework"
import { CoreComponents } from "../../core-components"
import { CoreEvents } from "../../core-events"
import { WorldComponents } from "../world-entity"

export class RapierStepSystem implements System<CoreEvents> {
    private world: EntityWith<CoreComponents, "rapier">

    constructor(entities: EntityStore<CoreComponents>) {
        this.world = entities.single(...WorldComponents)
    }

    onUpdate() {
        this.world.get("rapier").world.step(this.world.get("rapier").queue)
    }
}
