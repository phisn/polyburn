import { MessageCollector } from "./message-collector"
import {
    InferTargetComponents,
    MessageWithTarget,
    WithoutTarget,
    WithTarget,
} from "./message-with-target"
import { NarrowProperties } from "./narrow-properties"

export interface MessageStore<Components extends object, Messages extends object> {
    publish<T extends keyof WithoutTarget<Messages, Components>>(
        messageName: T,
        message: WithoutTarget<Messages, Components>[T],
    ): this
    publishTarget<T extends keyof WithTarget<Messages, Components>>(
        messageName: T,
        message: WithTarget<Messages, Components>[T],
    ): this

    collect<T extends keyof Messages>(messageName: T): MessageCollector<Required<Messages>[T]>
    collectTarget<
        T extends keyof WithTarget<Messages, Components>,
        K extends (keyof Components & keyof InferTargetComponents<Messages[T]>)[],
    >(
        messageName: T,
        ...components: [...K]
    ): MessageCollector<
        MessageWithTarget<NarrowProperties<Components, K[number]>> &
            WithTarget<Required<Messages>, Components>[T]
    >

    listenTo<T extends keyof Messages>(
        messageName: T,
        callback: (message: Required<Messages>[T]) => void,
    ): () => void
}

export type EmptyMessage = Record<string, never>

export const createMessageStore = <
    Components extends object,
    Messages extends object,
>(): MessageStore<Components, Messages> => {
    const listenerMap = new Map<
        string,
        Set<(message: Required<Messages>[keyof Messages]) => void>
    >()
    const componentListenerMap = new Map<
        string,
        Set<(message: MessageWithTarget<Partial<Components>>) => void>
    >()

    return {
        publish<T extends keyof WithoutTarget<Messages, Components>>(
            messageName: T,
            message: WithoutTarget<Messages, Components>[T],
        ) {
            for (const callback of listenerMap.get(messageName.toString()) ?? []) {
                callback(message)
            }

            return this
        },
        publishTarget<T extends keyof WithTarget<Messages, Components>>(
            messageName: T,
            message: WithTarget<Messages, Components>[T],
        ) {
            for (const component of Object.keys(message.target.components)) {
                for (const callback of componentListenerMap.get(
                    `${messageName.toString()}${component}`,
                ) ?? []) {
                    callback(message)
                }
            }

            for (const callback of listenerMap.get(messageName.toString()) ?? []) {
                callback(message)
            }

            return this
        },
        collect<T extends keyof Messages>(messageName: T): MessageCollector<Required<Messages>[T]> {
            let listeners = listenerMap.get(messageName.toString())

            if (listeners === undefined) {
                listeners = new Set()
                listenerMap.set(messageName.toString(), listeners)
            }

            let messages = [] as Messages[keyof Messages][]

            const listener = (message: Messages[keyof Messages]) => messages.push(message)

            listeners.add(listener)

            const collector: Iterable<Required<Messages>[T]> = {
                [Symbol.iterator]() {
                    const consumedMessages = messages as Required<Messages>[T][]
                    messages = []
                    return consumedMessages.values()
                },
            }

            return collector
        },
        collectTarget<
            T extends keyof WithTarget<Messages, Components>,
            K extends (keyof Components & keyof InferTargetComponents<Messages[T]>)[],
        >(
            messageName: T,
            ...components: [...K]
        ): MessageCollector<
            MessageWithTarget<NarrowProperties<Components, K[number]>> &
                WithTarget<Required<Messages>, Components>[T]
        > {
            const [firstComponent] = components
            const key = `${messageName.toString()}${firstComponent.toString()}`

            let listeners = componentListenerMap.get(key)

            if (listeners === undefined) {
                listeners = new Set()
                componentListenerMap.set(key, listeners)
            }

            let messages = [] as MessageWithTarget<Partial<Components>>[]

            const listener = (message: MessageWithTarget<Partial<Components>>) => {
                if (message.target.has(...components)) {
                    messages.push(message)
                }
            }

            listeners.add(listener)

            const collector: MessageCollector<
                MessageWithTarget<NarrowProperties<Components, K[number]>> &
                    WithTarget<Required<Messages>, Components>[T]
            > = {
                [Symbol.iterator]() {
                    const consumedMessages = messages as (MessageWithTarget<
                        NarrowProperties<Components, K[number]>
                    > &
                        WithTarget<Required<Messages>, Components>[T])[]
                    messages = []
                    return consumedMessages.values()
                },
            }

            return collector
        },

        listenTo<T extends keyof Messages>(
            messageName: T,
            callback: (message: Required<Messages>[T]) => void,
        ): () => void {
            let listeners = listenerMap.get(messageName.toString())

            if (listeners === undefined) {
                listeners = new Set()
                listenerMap.set(messageName.toString(), listeners)
            }

            listeners.add(callback as (message: Messages[keyof Messages]) => void)
            return () => listeners?.delete(callback as (message: Messages[keyof Messages]) => void)
        },
    }
}
