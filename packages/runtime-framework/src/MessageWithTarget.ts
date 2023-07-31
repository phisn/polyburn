import { Entity } from "./Entity"

export interface MessageWithTarget<Components extends object> {
    target: Entity<Components>
}

export type InferTargetComponents<T> = T extends MessageWithTarget<infer Components>
    ? Components
    : never

export type WithTarget<Message extends object, Components extends object> = {
    [K in keyof Message]: Required<Message>[K] extends MessageWithTarget<Components>
        ? Required<Message>[K]
        : never
}

export type WithoutTarget<Message extends object, Components extends object> = {
    [K in keyof Message]: Required<Message>[K] extends MessageWithTarget<Components>
        ? never
        : Required<Message>[K]
}
