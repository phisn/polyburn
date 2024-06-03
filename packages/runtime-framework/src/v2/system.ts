import RAPIER from "@dimforge/rapier2d"

interface SchedulePhysicsEvent {
    schedulePhysics(delta: number): void
}

interface CollisionEvent {
    collisionEvent(target: RAPIER.Collider, other: RAPIER.Collider, started: boolean): void
}

type Args<T> = T extends (...args: infer U) => any ? U : never

type SystemEvents = SchedulePhysicsEvent

interface SystemContext {
    rapier: typeof RAPIER
    eventStore: EventStore
}

type System = Partial<SystemEvents>

class MySystem implements System {
    schedulePhysics(delta: number, world: RAPIER.World) {
        console.log("Schedule physics", delta)
        this.context.eventStore.dispatch.schedulePhysics(delta)
    }
}

const system = new MySystem()

system.schedulePhysics(...[1, 2])
