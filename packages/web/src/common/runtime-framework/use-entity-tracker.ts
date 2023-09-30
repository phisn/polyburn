import { useSyncExternalStore } from "react"
import { Entity } from "runtime-framework"
import { EntityTracker } from "runtime-framework/src/entity-tracker"

export function useEntityTracker<Components extends object>(tracker: EntityTracker<Components>) {
    let memoizeValues: [Entity<Components>[], (keyof Components)[]] = [
        [...tracker],
        tracker.components(),
    ]

    return useSyncExternalStore(
        callback => {
            const onChange = () => {
                memoizeValues = [[...tracker], tracker.components()]
                callback()
            }

            tracker.onChange(onChange)

            return () => tracker.onChange(onChange)
        },
        () => memoizeValues,
    )
}
