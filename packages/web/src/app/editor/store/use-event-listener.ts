import { useEffect, useRef } from "react"
import { BehaviorEvent } from "../behaviors/behaviors"
import { useEditorStore } from "./store"

export function useEventListener<T extends BehaviorEvent["type"]>(
    type: T,
    targetId: number,
    listener: (value: BehaviorEvent & { type: T }) => void,
) {
    const ref = useRef(wrap(type, listener))
    useEffect(() => void (ref.current = wrap(type, listener)), [listener, type])

    const listen = useEditorStore(store => store.listen)
    useEffect(() => listen(targetId, ref), [listen, targetId])
}

function wrap<T extends BehaviorEvent["type"]>(
    type: T,
    listener: (value: BehaviorEvent & { type: T }) => void,
) {
    return (value: BehaviorEvent) => {
        if (value.type === type) {
            listener(value as any)
        }
    }
}
