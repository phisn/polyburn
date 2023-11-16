import { useEffect, useRef } from "react"
import { ImmutableEntity } from "../entities/entity"
import { resolveEntityOrder } from "../entities/resolve-entity-order"
import { useEditorStore } from "../store/store"
import { PipelineEvent } from "../view-canvas/pipeline-event"

interface Listeners {
    default: (event: PipelineEvent) => void
    selected: (event: PipelineEvent) => void
    action: (event: PipelineEvent) => void
}

export function makeBehaviorTemplate<Props, Action, Entity extends ImmutableEntity>(
    useListeners: (
        entity: Entity,
        propsRef: React.MutableRefObject<Props>,
        actionRef: React.MutableRefObject<Action | undefined>,
        useListen: (listeners: Listeners) => void,
    ) => void,
) {
    return function useBehavior(entity: Entity, props: Props) {
        const selected = useEditorStore(store => store.selected).includes(entity.id)

        const ref = useRef<Props>({ ...props })
        useEffect(() => void (ref.current = props), [props])

        const actionRef = useRef<Action | undefined>()

        return useListeners(entity, ref, actionRef, function useListen(listeners) {
            useEventListener(
                event => {
                    if (selected) {
                        return listeners.selected(event)
                    }

                    if (actionRef.current) {
                        return listeners.action(event)
                    }

                    return listeners.default(event)
                },
                resolveEntityOrder({
                    entityType: entity.type,
                    behaviorType: "object",
                    selected,
                    inAction: false,
                }),
            )
        })
    }
}
