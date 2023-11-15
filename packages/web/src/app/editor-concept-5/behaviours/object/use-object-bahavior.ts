import { useState } from "react"
import { useListenerRef } from "../../use-listener"

export function useObjectBehavior(
    ImmutableEntityWith<"object">,
    props: {
    isInside: (x: number, y: number) => boolean
    setPosition: (x: number, y: number) => void
}) {
    const isInsideRef = useListenerRef(props.isInside)
    const setPositionRef = useListenerRef(props.setPosition)

    const [isHovered, setIsHovered] = useState(false)

    useEventListener(event => {})
}
