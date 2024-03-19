export const BackgroundContextMenu = () =>
    // position: Point) =>
    function CreateEntityMenu() {
        /*
        function spawnPositionForType(position: Point, type: EntityType) {
            return {
                x: position.x - entityRegistry[type].width / 2,
                y: position.y + entityRegistry[type].height / 2,
            }
        }
        */

        return (
            /*
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
            */
            <></>
        )
    }
