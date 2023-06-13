import { EntityWith } from "runtime-framework/src/NarrowComponents"

import { RuntimeComponents } from "../RuntimeComponents"

export const RocketEntityComponents = ["rocket", "rigidBody", "moving", "collisionEventListener"] as const

export type RocketEntity = EntityWith<RuntimeComponents, typeof RocketEntityComponents[number]>
