import { RuntimeStore } from "runtime-framework"

import { ShapeModel } from "../../model/world/ShapeModel"
import { Meta } from "../Meta"
import { SystemContext } from "../SystemContext"

export const newShape = (meta: Meta, store: RuntimeStore<SystemContext>, shape: ShapeModel) => {
    // maybe find way to enforce that new entities have a entitytypecomponent?? or not !simple halten

    store.newEntity()
}
