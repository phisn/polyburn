
import { useEffect } from "react"

import { InterpolationUpdate } from "../store/interpolation/InterpolationUpdate"
import { useGameStore } from "../store/useGameStore"

export function useInterpolation(
    callback: (update: InterpolationUpdate) => void,
) {
    const interpolateSubscribe = useGameStore(state => state.interpolateSubscribe)
    useEffect(() => interpolateSubscribe(callback), [callback, interpolateSubscribe])
}
