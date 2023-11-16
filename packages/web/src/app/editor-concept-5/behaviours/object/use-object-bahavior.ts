import { useState } from "react"
import { Point } from "runtime/src/model/point"
import { ImmutableEntityWith } from "../../entities/entity"
import { useEditorStore } from "../../store/store"
import { ConsumeEvent, PipelineEvent } from "../../view-canvas/pipeline-event"
import { makeBehaviorTemplate } from "../make-behavior-template"

export interface MovingEntityEntry {
    entity: ImmutableEntityWith<"object">

    offsetPosition: Point
    offsetRotation: number

    position: Point
    rotation: number
}

export interface State {
    type: "none"
}

export interface StateMoving {
    type: "moving"

    rotation: number
    position: Point
}

interface Action {
    type: "moving"
    entries: MovingEntityEntry[]
}

interface Props {
    setHovered: (isHovered: boolean) => void
    isInside: (point: Point) => boolean
    setPosition: (point: Point, rotation: number) => void
}

export const useObjectBehavior = makeBehaviorTemplate<Props, Action, ImmutableEntityWith<"object">>(
    function useListeners(entity, propsRef, actionRef, useListen) {

        const select = useEditorStore(store => store.select)

        useListen({
            default: (event: PipelineEvent) => {
                const inside = propsRef.current.isInside(event.position)

                setIsHovered(inside)

                if (inside) {
                    if (event.shiftKey) {
                        if (event.leftButtonClicked) {
                            document.body.style.cursor = "grabbing"

                            setInAction(true)
                            actionRef.current = {
                                type: "moving",
                                entries: [
                                    {
                                        entity,

                                        offsetPosition: {
                                            x: entity.object.position.x - event.positionInGrid.x,
                                            y: entity.object.position.y - event.positionInGrid.y,
                                        },
                                        offsetRotation: entity.object.rotation,

                                        position: entity.object.position,
                                        rotation: entity.object.rotation,
                                    },
                                ],
                            }
                        } else {
                            document.body.style.cursor = "grab"
                        }
                    } else if (event.leftButtonClicked) {
                        select(entity.id)
                    }

                    return ConsumeEvent
                }
            },
            selected: (event: PipelineEvent) => {
                const inside = propsRef.current.isInside(event.position)

                setIsHovered(inside)

                if (inside) {
                    if (event.shiftKey) {
                        if (event.leftButtonClicked) {
                            document.body.style.cursor = "grabbing"

                            setInAction(true)
                            actionRef.current = {
                                type: "moving",
                                entries: [
                                    {
                                        entity,

                                        offsetPosition: {
                                            x: entity.object.position.x - event.positionInGrid.x,
                                            y: entity.object.position.y - event.positionInGrid.y,
                                        },
                                        offsetRotation: entity.object.rotation,

                                        position: entity.object.position,
                                        rotation: entity.object.rotation,
                                    },
                                ],
                            }
                        } else {
                            document.body.style.cursor = "grab"
                        }
                    } else if (event.leftButtonClicked) {
                        select(entity.id)
                    }

                    return ConsumeEvent
            },
            action: (event: PipelineEvent) => {

            },
        })

        return {
            isHovered,
            inAction,
        }
    },
)
