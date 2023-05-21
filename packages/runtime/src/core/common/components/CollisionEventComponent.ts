interface CollisionEvent {
    other: number
    started: boolean
    sensor: boolean
}

export interface CollisionEventComponent {
    events: CollisionEvent[]
}
