import { Entity } from "./Entity"

export interface MessageWithTarget<Components extends object> {
    target: Entity<Components>
}

export type InfertTargetComponents<T> = T extends MessageWithTarget<infer Components> ? Components : never

export type NarrowWithTarget<Message extends object, Components extends object> =
    { [K in keyof Message]: Message[K] extends MessageWithTarget<Components> ? Message[K] : never }

export type NarrowWithoutTarget<Message extends object, Components extends object> =
    { [K in keyof Message]: Message[K] extends MessageWithTarget<Components> ? never : Message[K] }

