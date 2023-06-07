import { Entity, EntityStore } from "runtime-framework"
import { Components } from "runtime/src/core/Components"

export function Camera(props: { store: EntityStore }) {
    const [ rocket ] = props.store.getState().findEntities(Components.Rocket)
    

    return <CameraWithEntities rocket={rocket} />
}

export function CameraWithEntities(props: { rocket: Entity }) {


    return (
        <>

        </>
    )

}
