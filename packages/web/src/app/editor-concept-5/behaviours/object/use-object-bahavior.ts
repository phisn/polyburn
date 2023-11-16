import { useRef, useState } from "react"
import { Point } from "runtime/src/model/point"
import { ImmutableEntityWith } from "../../entities/entity"
import { resolveEntityOrder } from "../../entities/resolve-entity-order"
import { useEditorStore } from "../../store/store"
import { useListenerRef } from "../../use-listener"
import { ConsumeEvent, PipelineEvent } from "../../view-canvas/pipeline-event"

export interface MovingEntityEntry {
    entity: ImmutableEntityWith<"object">

    offsetPosition: Point
    offsetRotation: number

    position: Point
    rotation: number
}

export interface StateMoving {
    type: "moving"
    entries: MovingEntityEntry[]
}

export function useObjectBehavor(
    entity: ImmutableEntityWith<"object">,
    props: {
        isInside: (point: Point) => boolean
        setPosition: (point: Point, rotation: number) => void
    },
) {
    const propsRef = useListenerRef(props)

    const selected = useEditorStore(store => store.selected).includes(entity.id)

    const [isHovered, setIsHovered] = useState(false)
    const [inAction, setInAction] = useState(false)

    const stateRef = useRef<StateMoving | null>(null)

    useEventPipeline(
        event => {
            const result = eventHandler(event)

            if (result !== ConsumeEvent) {
                setIsHovered(false)
            }

            return ConsumeEvent
        },
        resolveEntityOrder({
            entityType: entity.type,
            behaviorType: "object",
            hovered: isHovered,
            selected,
            inAction: false,
        }),
    )

    function eventHandler(event: PipelineEvent) {
        if (selected) {
            return eventHandlerSelected(event)
        }

        switch (stateRef.current?.type) {
            case "moving":
                return eventHandlerMoving(event)

            default:
                return eventHandlerDefault(event)
        }
    }

    function eventHandlerDefault(event: PipelineEvent) {
        const isInside = isInsideRef.current(event.position)

        if (isInside) {
            setIsHovered(true)
        }

        return ConsumeEvent
    }

    function eventHandlerSelected(event: PipelineEvent) {}

    function eventHandlerMoving(event: PipelineEvent) {}

    return {
        isHovered,
        inAction,
    }
}
