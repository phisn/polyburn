import { MessageCollector } from "./MessageCollector"

export interface MessageStore<Message extends object> {
    publish<T extends keyof Message>(messageName: T, message: Required<Message>[T]): this
    collect<T extends keyof Message>(messageName: T): MessageCollector<Message, T>
}

export type EmptyMessage = Record<string, never>

export const createMessageStore = <Message extends object>(): MessageStore<Message> => {
    const listenerMap = new Map<keyof Message, Set<(message: Message[keyof Message]) => void>>()

    return {
        publish<T extends keyof Message>(messageName: T, message: Required<Message>[T]) {
            for (const key of Object.keys(messageName)) {
                for (const callback of listenerMap.get(key as keyof Message) ?? []) {
                    callback(message)
                }
            }

            return this
        },
        collect<T extends keyof Message>(message: T): MessageCollector<Message, T> {
            let listeners = listenerMap.get(message)

            if (listeners === undefined) {
                listeners = new Set()
                listenerMap.set(message, listeners)
            }

            let messages = [] as Message[keyof Message][]

            const listener = (message: Message[keyof Message]) =>
                messages.push(message)

            listeners.add(listener)
            
            const collector = {
                consume() {
                    const consumedMessages = messages
                    messages = []
                    return consumedMessages as Message[T][]
                },
                free() {
                    listeners?.delete(listener)
                }
            }

            return collector
        }
    }
}
