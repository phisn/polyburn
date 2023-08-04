import { RefObject, useEffect, useRef } from "react"

export function useUnclick(
    ref: RefObject<HTMLElement>,
    onUnclick: () => void,
    condition: boolean = true,
) {
    const onUnclickRef = useRef(onUnclick)

    useEffect(() => {
        onUnclickRef.current = onUnclick
    }, [onUnclick])

    useEffect(() => {
        if (condition) {
            const listener = (e: PointerEvent) => {
                if (e.target instanceof Node && !ref.current?.contains(e.target)) {
                    onUnclickRef.current()
                }
            }

            window.addEventListener("pointerdown", listener)

            return () => void window.removeEventListener("pointerdown", listener)
        }
    }, [condition])
}
