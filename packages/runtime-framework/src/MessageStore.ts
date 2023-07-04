import { MessageCollector } from "./MessageCollector"
import { InfertTargetComponents as InferTargetComponents, MessageWithTarget, NarrowWithoutTarget as WithoutTarget, NarrowWithTarget as WithTarget } from "./MessageWithTarget"
import { NarrowProperties } from "./NarrowProperties"

export interface MessageStore<Components extends object, Messages extends object> {
    publish<T extends keyof WithoutTarget<Messages, Components>>(messageName: T, message: WithoutTarget<Messages, Components>[T]): this
    publishTarget<T extends keyof WithTarget<Messages, Components>>(messageName: T, message: WithTarget<Messages, Components>[T]): void

    collect<T extends keyof Messages>(messageName: T): MessageCollector<Messages, T>
    collectTarget<T extends keyof WithTarget<Messages, Components>, K extends (keyof Components & keyof InferTargetComponents<Messages[T]>)[]>(messageName: T, ...components: [...K]): MessageWithTarget<NarrowProperties<Components, K[number]>>
}

export type EmptyMessage = Record<string, never>

export const createMessageStore = <Components extends object, Messages extends object>(): MessageStore<Components, Messages> => {
    const listenerMap = new Map<keyof Messages, Set<(message: Messages[keyof Messages]) => void>>()

    return {
        publish<T extends keyof WithoutTarget<Messages, Components>>(messageName: T, message: WithoutTarget<Messages, Components>[T]) {
            for (const key of Object.keys(messageName)) {
                for (const callback of listenerMap.get(key as keyof Messages) ?? []) {
                    callback(message)
                }
            }

            return this
        },
        publishTarget<T extends keyof WithTarget<Messages, Components>>(messageName: T, message: WithTarget<Messages, Components>[T]) {
            void 0
        },
        collect<T extends keyof Messages>(messageName: T): MessageCollector<Messages, T> {
            let listeners = listenerMap.get(messageName)

            if (listeners === undefined) {
                listeners = new Set()
                listenerMap.set(messageName, listeners)
            }

            let messages = [] as Messages[keyof Messages][]

            const listener = (message: Messages[keyof Messages]) =>
                messages.push(message)

            listeners.add(listener)
            
            const collector = {
                consume() {
                    const consumedMessages = messages
                    messages = []
                    return consumedMessages as Messages[T][]
                },
                free() {
                    listeners?.delete(listener)
                }
            }

            return collector
        },
        collectTarget<T extends keyof WithTarget<Messages, Components>, K extends (keyof Components & keyof InferTargetComponents<Messages[T]>)[]>(messageName: T, ...components: [...K]): MessageWithTarget<NarrowProperties<Components, K[number]>> {
            return null!
        }
    }
}
