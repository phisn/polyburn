import { EntityWith } from "runtime-framework/src/NarrowComponents"

import { RuntimeComponents } from "../RuntimeComponents"

export interface LevelCapturingComponent {
    level: EntityWith<RuntimeComponents, "level">
    timeToCapture: number
}
