import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/Point"
import { entityRegistry } from "runtime/src/model/entityRegistry"
import { ContextMenu } from "../../../../common/components/ContextMenu"
import { FlagSvg } from "../../../../common/components/inline-svg/Flag"
import { RocketSvg } from "../../../../common/components/inline-svg/Rocket"
import { TriangleSvg } from "../../../../common/components/inline-svg/Triangle"
import { levelNew } from "../../entities/level/mutations/levelNew"
import { rocketNew } from "../../entities/rocket/mutations/rocketNew"
import { shapeNew } from "../../entities/shape/mutations/shapeNew"
import { MutationGenerator } from "../../store/EditorStore"

export function CreateEntityMenu(props: {
    position: Point
    dispatchMutation: (mutation: MutationGenerator) => void
    onCancel: () => void
}) {
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
                        props.dispatchMutation(shapeNew({ ...props.position }))
                        props.onCancel()
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
                            rocketNew(spawnPositionForType(props.position, EntityType.ROCKET), 0),
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
