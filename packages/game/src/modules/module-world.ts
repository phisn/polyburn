import RAPIER from "@dimforge/rapier2d"
import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../store"
import { levelComponents } from "./module-level"

export interface SummaryResource {
    deaths: number
    finished: boolean
    flags: number
    ticks: number
}

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

        this.store.events.listen({
            captured: () => {
                const summary = this.store.resources.get("summary")
                summary.flags += 1

                const finished = this.store.entities
                    .multiple(...levelComponents)
                    .every(l => l.get("level").completed)

                if (finished) {
                    summary.finished = true
                    this.store.events.invoke.finished?.()
                }
            },
            death: () => {
                const summary = this.store.resources.get("summary")
                summary.deaths += 1
            },
        })
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

        const summary = this.store.resources.get("summary")
        summary.ticks += 1
    }

    onReset() {
        const world = this.store.resources.getOr("world", undefined)

        if (world) {
            world.free()
        }

        const rapier = this.store.resources.get("rapier")
        this.store.resources.set("world", new rapier.World(new rapier.Vector2(0, -20)))

        this.store.resources.set("summary", {
            deaths: 0,
            finished: false,
            flags: 0,
            ticks: 0,
        })
    }
}
