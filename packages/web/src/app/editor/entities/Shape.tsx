import { ShapeState } from "./ShapeState"

export function Shape(props: { id: string }) {
    const state: ShapeState = useEntityState(props.id) as ShapeState

    return <></>
}
