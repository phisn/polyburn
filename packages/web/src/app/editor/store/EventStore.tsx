import { OrderedSet } from "js-sdsl"
import {
    MutableRefObject,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react"
import { EditorEvent } from "../EventHandler"

export const ConsumeEvent = Symbol("ConsumeEvent")

interface Listener {
    callback: (event: EditorEvent) => void | typeof ConsumeEvent
    priority: number
}

type ListenerRef = MutableRefObject<Listener>

interface EventStore {
    subscribeEvent: (listener: ListenerRef) => () => void

    event: (event: EditorEvent) => boolean
}

const createEventStore = (): EventStore => {
    const listeners = new OrderedSet<ListenerRef>([], (x, y) => {
        if (x.current.priority === y.current.priority) {
            return x.current.callback === y.current.callback ? 0 : -1
        }

        return y.current.priority - x.current.priority
    })

    return {
        subscribeEvent: listener => {
            listeners.insert(listener)

            return () => {
                listeners.eraseElementByKey(listener)
            }
        },
        event: event => {
            for (const listener of listeners) {
                if (listener.current.callback(event) === ConsumeEvent) {
                    if (event.consumed) {
                        console.error(
                            "Event was consumed multiple times. This is not allowed.",
                            listener.current.callback,
                        )
                    }

                    event.consumed = true
                }
            }

            return false
        },
    }
}

const Context = createContext<EventStore>(null!)

export function ProvideEventStore(props: { children: React.ReactNode }) {
    const store = useMemo(createEventStore, [])

    return <Context.Provider value={store}>{props.children}</Context.Provider>
}

export function useEventListener(
    callback: (event: EditorEvent) => void | typeof ConsumeEvent,
    priority: number,
) {
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
