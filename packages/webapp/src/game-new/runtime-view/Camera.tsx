import { Components } from "runtime/src/core/Components"

import { Entity, EntityStore } from "../../../../runtime-framework/src"

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
