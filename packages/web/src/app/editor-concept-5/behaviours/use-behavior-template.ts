import { useEffect, useRef } from "react"
import { ImmutableEntityWith } from "../entities/entity"
import { useEditorStore } from "../store/store"
import { PipelineEvent } from "../view-canvas/pipeline-event"
import { BehaviorType } from "./base-behaviors"

interface State {
    type: string
}

export function makeBehaviorTemplate<Props, S extends State, Behavior extends BehaviorType>(
    f: () => void,
) {
    return function useBehavior(entity: ImmutableEntityWith<Behavior>, props: Props) {
        const selected = useEditorStore(store => store.selected).includes(entity.id)

        const ref = useRef(props)
        useEffect(() => void (ref.current = props), [props])

        const stateRef = useRef<S | undefined>()

        useEventListener((event: PipelineEvent) => {
            if (selected) {
                f.selected()
            }

            const state = stateRef.current

            if (state === undefined) {
                f.else()
            } else {
                f[state.type as keyof S["type"]](event, stateRef.current as any)
            }
        })
    }
}
