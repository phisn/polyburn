export interface CoreInput {
    rotation: number
    thrust: boolean
}

export interface OnUpdateCoreEvent {
    onCoreUpdate(input: CoreInput): void
}

export type CoreEvents = OnUpdateCoreEvent
