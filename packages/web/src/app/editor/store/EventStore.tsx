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

    events: OrderedSet<ListenerRef>
}

const createEventStore = (): EventStore => {
    return {
        subscribeEvent(): () => void {
            return () => {}
        },
        event(event: EditorEvent) {
            for (const listener of this.events) {
                if (listener.current.callback(event) === ConsumeEvent) {
                    return true
                }
            }

            return false
        },
        events: new OrderedSet<ListenerRef>(
            [],
            (x, y) => y.current.priority - x.current.priority,
        ),
    }
}

const Context = createContext<EventStore>(null!)

export function ProvideEntityStore(props: { children: React.ReactNode }) {
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
}

