import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/point"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import { ContextMenu } from "../../../../../common/components/ContextMenu"
import { FlagSvg } from "../../../../common/components/inline-svg/Flag"
import { RocketSvg } from "../../../../common/components/inline-svg/Rocket"
import { TriangleSvg } from "../../../../common/components/inline-svg/Triangle"
import { levelNew } from "../../entities/level/mutations/LevelNew"
import { rocketNew } from "../../entities/rocket/mutations/RocketNew"
import { shapeNew } from "../../entities/shape/mutations/shape-new"

export const CreateEntityMenu = (position: Point) =>
    function CreateEntityMenu() {
        function spawnPositionForType(position: Point, type: EntityType) {
            return {
                x: position.x - entityRegistry[type].width / 2,
                y: position.y + entityRegistry[type].height / 2,
            }
        }

        return (
            <ContextMenu>
                <li>
                    <a
                        onClick={() => {
                            dispatchMutation(shapeNew(position))
                            onCancel()
                        }}
                    >
                        <TriangleSvg width="16" height="16" />
                        Create Shape
                    </a>
                </li>
                <li>
                    <a
                        onClick={() => {
                            props.dispatchMutation(
                                rocketNew(
                                    spawnPositionForType(props.position, EntityType.ROCKET),
                                    0,
                                ),
                            )
                            props.onCancel()
                        }}
                    >
                        <RocketSvg width="16" height="16" />
                        Create Rocket
                    </a>
                </li>
                <li>
                    <a
                        onClick={() => {
                            props.dispatchMutation(
                                levelNew(spawnPositionForType(props.position, EntityType.LEVEL), 0),
                            )
                            props.onCancel()
                        }}
                    >
                        <FlagSvg width="16" height="16" />
                        Create Level
                    </a>
                </li>
            </ContextMenu>
        )
    }
