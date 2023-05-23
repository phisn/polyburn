import { EntityStore } from "runtime-framework"

import { ShapeModel } from "../../model/world/ShapeModel"
import { Meta } from "../Meta"

export const newShape = (meta: Meta, store: EntityStore, shape: ShapeModel) => {
    // maybe find way to enforce that new entities have a entitytypecomponent?? or not !simple halten

    store.getState().newEntity()
}
