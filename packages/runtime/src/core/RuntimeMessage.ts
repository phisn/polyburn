import { EmptyMessage } from "runtime-framework"

import { CollisionMessage } from "./collision/CollisionMessage"

export interface RuntimeMessage {
    finished?: EmptyMessage
    collision: CollisionMessage
}
