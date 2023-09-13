import { EntityStore } from "runtime-framework"

import { WebappComponents } from "../../runtime-webapp/WebappComponents"
import { FlagGraphics } from "./FlagGraphic"
import { ParticleSourceGraphics } from "./ParticleSourceGraphic"
import { ReplayGraphics } from "./ReplayGraphic"
import { RocketGraphics } from "./RocketGraphic"
import { ShapeGraphics } from "./ShapeGraphic"

export default function EntityGraphics(props: { store: EntityStore<WebappComponents> }) {
    return (
        <>
            <ShapeGraphics store={props.store} />
            <RocketGraphics store={props.store} />
            <FlagGraphics store={props.store} />
            <ParticleSourceGraphics store={props.store} />
            <ReplayGraphics store={props.store} />
        </>
    )
}
