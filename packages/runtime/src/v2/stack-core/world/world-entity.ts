import { EntityWith } from "runtime-framework"
import { CoreComponents } from "../core-components"

export const WorldComponents: (keyof CoreComponents)[] = ["rapier", "config"]
export type WorldEntity = EntityWith<CoreComponents, (typeof WorldComponents)[number]>
