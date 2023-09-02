import { ReplayGraphic } from "../../graphics/ReplayGraphic"
import { WebappFactoryContext } from "../WebappFactoryContext"
import { ReplayPrepared } from "./prepare/ReplayPrepared"

export function newReplay(context: WebappFactoryContext, prepared: ReplayPrepared) {
    return context.store.create({
        replay: {
            prepared,
            frame: 0,
        },
        graphic: ReplayGraphic,
    })
}
