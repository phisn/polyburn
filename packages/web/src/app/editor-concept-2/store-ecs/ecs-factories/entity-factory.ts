import { EntityEditModel, RocketEditModel } from "../../store/edit-models/entity-edit-model"
import { EcsEntity } from "../ecs-models/ecs-entity"

export function entityFromView(entity: EntityEditModel): EcsEntity {
    const rocket = entity as RocketEditModel

    const k: EcsEntity = {
        type: entity.type,
        id: entity.id,
        group: entity.group,
        components: {
            object: {
                position: rocket.position,
                rotation: rocket.rotation,
            },
        },
    }

    return k
}
