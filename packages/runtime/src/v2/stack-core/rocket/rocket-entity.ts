import { EntityWith } from "runtime-framework"
import { CoreComponents } from "../core-components"

export const RocketComponents: (keyof CoreComponents)[] = ["rocket", "type", "rigidbody"]
export type RocketEntity = EntityWith<CoreComponents, (typeof RocketComponents)[number]>
