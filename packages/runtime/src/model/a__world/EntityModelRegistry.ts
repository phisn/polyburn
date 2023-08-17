import { EntityType } from "../../core/common/EntityType"

interface Entry {
    width: number
    height: number
}

export interface EntityModelRegistry {
    [key: string]: Entry
}

export const entityModelRegistry: EntityModelRegistry = {
    [EntityType.Rocket]: {
        width: 1.8,
        height: 3.6,
    },
    [EntityType.Level]: {
        width: 1.65,
        height: 2.616,
    },
}
