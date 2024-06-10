import RAPIER from "@dimforge/rapier2d"

export interface RapierComponent {
    instance: typeof RAPIER
    world: RAPIER.World
    queue: RAPIER.EventQueue
}
