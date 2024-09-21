import RAPIER from "@dimforge/rapier2d"
import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"

export class ModuleWorld {
    private bodyToEntity: Map<number, EntityWith<GameComponents, "body">>
    private queue: RAPIER.EventQueue

    constructor(private store: GameStore) {
        this.bodyToEntity = new Map()
        this.queue = new RAPIER.EventQueue(false)

        this.store.entities.listen(
            ["body"],
            entity => {
                const c: EntityWith<GameComponents, "body"> = entity
                this.bodyToEntity.set(entity.get("body").handle, c)
            },
            entity => {
                this.bodyToEntity.delete(entity.get("body").handle)
            },
        )
    }

    onUpdate(_input: GameInput) {
        const world = this.store.resources.get("world")
        world.step(this.queue)

        this.queue.drainCollisionEvents((h1, h2, started) => {
            const c1 = world.getCollider(h1)
            const p1 = c1.parent()
            const e1 = p1 && this.bodyToEntity.get(p1.handle)

            const c2 = world.getCollider(h2)
            const p2 = c2.parent()
            const e2 = p2 && this.bodyToEntity.get(p2.handle)

            this.store.events.invoke.collision?.({
                c1,
                c2,
                e1: e1 ?? undefined,
                e2: e2 ?? undefined,
                started,
            })
        })
    }

    onReset() {
        const world = this.store.resources.getOr("world", undefined)

        if (world) {
            world.free()
        }

        const rapier = this.store.resources.get("rapier")
        this.store.resources.set("world", new rapier.World(new rapier.Vector2(0, -20)))
    }
}
