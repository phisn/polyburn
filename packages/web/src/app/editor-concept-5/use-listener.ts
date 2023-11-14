import { useEffect, useRef } from "react"

export function useListenerRef<T>(listener: T) {
    const ref = useRef(listener)

    useEffect(() => {
        ref.current = listener
    }, [listener])

    return ref
}
