import RAPIER from "@dimforge/rapier2d"
import { Module, ModuleStore } from "runtime-framework/src/module"
import { RuntimeBehaviors } from "../behaviors"

export interface Collidable {
    onCollision(props: {
        collider: RAPIER.Collider

        other?: Module<Pick<RuntimeBehaviors, "collidable">>
        otherCollider: RAPIER.Collider

        started: boolean
    }): void

    rigidbodyId: number
}

export function moduleCollision(store: ModuleStore<RuntimeBehaviors>) {
    const collidableStore = new CollidableStore(store)
    const world = store.single("world")().world

    return store.register(
        {
            onRuntimeTick() {
                world.rapierQueue.drainCollisionEvents((h1, h2, started) => {
                    const collider1 = world.rapierWorld.getCollider(h1)
                    const collider2 = world.rapierWorld.getCollider(h2)

                    const entity1 = collidableStore.get(collider1.parent()?.handle)
                    const entity2 = collidableStore.get(collider2.parent()?.handle)

                    entity1?.collidable?.onCollision({
                        collider: collider1,
                        other: entity2,
                        otherCollider: collider2,
                        started,
                    })

                    entity2?.collidable?.onCollision({
                        collider: collider2,
                        other: entity1,
                        otherCollider: collider1,
                        started,
                    })
                })
            },
        },
        function onDispose() {
            collidableStore.unlisten()
        },
    )
}

class CollidableStore {
    private entityFromHandle = new Map<number, Module<Pick<RuntimeBehaviors, "collidable">>>()

    constructor(private store: ModuleStore<RuntimeBehaviors>) {
        this.unlisten = store.listen(["collidable"], {
            notifyAdded: module => {
                this.entityFromHandle.set(module.collidable.rigidbodyId, module)
            },
            notifyRemoved: module => {
                this.entityFromHandle.delete(module.id)
            },
        })
    }

    unlisten: () => void

    get(handle?: number) {
        if (handle === undefined) {
            return undefined
        }

        return this.entityFromHandle.get(handle)
    }
}
