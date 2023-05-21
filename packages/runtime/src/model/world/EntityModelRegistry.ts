import { EntityModelType } from "./EntityModelType"

interface Entry {
    width: number
    height: number
}

export interface EntityModelRegistry {
    [key: string]: Entry
}

export const entityModelRegistry: EntityModelRegistry = {
    [EntityModelType.Rocket]: {
        width: 1.8, height: 3.6
    },
    [EntityModelType.GreenFlag]: {
        width: 1.65, height: 2.616
    },
    [EntityModelType.RedFlag]: {
        width: 1.65, height: 2.616
    }
}
