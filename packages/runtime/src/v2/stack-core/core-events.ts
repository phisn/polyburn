export interface CoreInput {
    rotation: number
    thrust: boolean
}

export interface CoreEvents {
    onUpdate(input: CoreInput): void
}
