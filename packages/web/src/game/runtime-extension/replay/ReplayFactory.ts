import { Vector3 } from "three"
import { WebappFactoryContext } from "../WebappFactoryContext"
import { ReplayComponent } from "./ReplayComponent"
import { ReplayPrepared } from "./prepare/ReplayPrepared"

export function newReplay(context: WebappFactoryContext, prepared: ReplayPrepared) {
    const replay: ReplayComponent = {
        prepared,
        frame: 0,
    }

    return context.store.create({
        replay,
        interpolation: {
            currentActive: () => true,
            currentTranslation: () => prepared.frames[replay.frame].position,
            currentRotation: () => prepared.frames[replay.frame].rotation,

            position: new Vector3(prepared.frames[0].position.x, prepared.frames[0].position.y),
            rotation: prepared.frames[0].rotation,

            newPosition: new Vector3(prepared.frames[0].position.x, prepared.frames[0].position.y),
            newRotation: prepared.frames[0].rotation,

            previousPosition: new Vector3(
                prepared.frames[0].position.x,
                prepared.frames[0].position.y,
            ),
            previousRotation: prepared.frames[0].rotation,
        },
    })
}
