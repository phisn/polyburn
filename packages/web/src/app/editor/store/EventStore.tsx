import { MutableRefObject, createContext, useContext, useEffect, useMemo, useRef } from "react"
import { EditorEvent } from "../EventHandler"

export const ConsumeEvent = Symbol("ConsumeEvent")

type Callback = (
    event: EditorEvent,
    setPriority: (priority: number) => void,
) => void | typeof ConsumeEvent

interface Listener {
    callback: Callback
    priority: number
}

type ListenerRef = MutableRefObject<Listener>

interface EventStore {
    subscribeEvent: (listener: ListenerRef) => () => void
    event: (event: EditorEvent) => boolean
}

const createEventStore = (): EventStore => {
    const listeners: ListenerRef[] = []

    function findPositionToInsert(priority: number) {
        // binary search to find the right position. we want to insert the listener right
        // of the last listener with the same or lower priority than the new listener

        let left = 0
        let right = listeners.length - 1

        while (left < right) {
            const middle = Math.floor((left + right) / 2)

            if (listeners[middle].current.priority <= priority) {
                left = middle + 1
            } else {
                right = middle
            }
        }

        return left
    }

    return {
        subscribeEvent: listener => {
            if (listeners[listeners.length - 1]?.current.priority <= listener.current.priority) {
                listeners.push(listener)
            } else {
                listeners.splice(findPositionToInsert(listener.current.priority), 0, listener)
            }

            return () => {
                const index = listeners.indexOf(listener)

                if (index === -1) {
                    console.error("listener was not found")
                } else {
                    listeners.splice(index, 1)
                }
            }
        },
        event: event => {
            const changePriorites: (() => void)[] = []

            for (let i = listeners.length - 1; i >= 0; i--) {
                const listener = listeners[i]

                const setPriority = (priority: number) =>
                    changePriorites.push(() => {
                        listeners.splice(i, 1)
                        listeners.splice(findPositionToInsert(priority), 0, listener)
                    })

                if (listener.current.callback(event, setPriority) === ConsumeEvent) {
                    if (event.consumed) {
                        console.error(
                            "Event was consumed multiple times. This is not allowed.",
                            listener.current.callback,
                        )
                    }

                    event.consumed = true
                }
            }

            for (const change of changePriorites) {
                change()
            }

            return event.consumed
        },
    }
}

const Context = createContext<EventStore>(null!)

export function ProvideEventStore(props: { children: React.ReactNode }) {
    const store = useMemo(createEventStore, [])

    return <Context.Provider value={store}>{props.children}</Context.Provider>
}

export function useEventListener(callback: Callback, priority: number) {
    const store = useContext(Context)

    const listenerRef = useRef<Listener>({
        callback,
        priority,
    })

    useEffect(() => {
        listenerRef.current.callback = callback
        listenerRef.current.priority = priority
    }, [callback, priority])

    useEffect(() => store.subscribeEvent(listenerRef), [store, priority])
}

export function useEventDispatch() {
    return useContext(Context).event
}

export enum Priority {
    Fallback = -1,
    Normal = 0,
    Selected = 1,
    Action = 2,
}
