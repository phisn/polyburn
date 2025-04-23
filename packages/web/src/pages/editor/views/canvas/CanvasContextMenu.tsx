import { Point } from "game/src/model/utils"
import { LEVEL_SIZE } from "game/src/modules/module-level"
import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { Popover } from "radix-ui"
import { generateUUID } from "three/src/math/MathUtils"
import { ArrowUpDownSvg } from "../../../../components/common/svg/ArrowUpDown"
import { FlagSvg } from "../../../../components/common/svg/Flag"
import { RocketSvg } from "../../../../components/common/svg/Rocket"
import { TriangleSvg } from "../../../../components/common/svg/Triangle"
import { useEditorStore } from "../../store/store"

export function CanvasContextMenu() {
    const contextMenu = useEditorStore(x => x.canvasContextMenu)

    function onClose() {
        useEditorStore.getState().setCanvasContextMenu()
    }

    return (
        <Popover.Root
            open={contextMenu !== undefined}
            onOpenChange={(x: boolean) => {
                if (x === false) {
                    useEditorStore.getState().setCanvasContextMenu()
                }
            }}
            modal={false}
        >
            {/* Invisible anchor at desired coordinate */}
            <Popover.Anchor asChild>
                <div
                    style={{
                        position: "absolute",
                        left: contextMenu?.positionWindow.x,
                        top: contextMenu?.positionWindow.y,
                        width: 0,
                        height: 0,
                        pointerEvents: "none",
                    }}
                />
            </Popover.Anchor>

            <Popover.Content
                sideOffset={4}
                collisionPadding={8}
                avoidCollisions
                align="start"
                side="right"
                className="bg-base-300 rounded-box z-50"
            >
                {contextMenu && contextMenu?.entityKey && (
                    <ContextMenuEntity entityKey={contextMenu.entityKey} onClose={onClose} />
                )}
                {contextMenu && !contextMenu?.entityKey && (
                    <ContextMenuGeneral point={contextMenu.position} onClose={onClose} />
                )}
            </Popover.Content>
        </Popover.Root>
    )
}

function ContextMenuEntity(props: { entityKey: string; onClose: () => void }) {
    const updateWorld = useEditorStore(x => x.updateWorld)

    function onRemove() {
        props.onClose()

        updateWorld(world => {
            delete world.entities[props.entityKey]
        })
    }

    return (
        <ul className="menu">
            <li>
                <a onClick={onRemove}>Remove</a>
            </li>
        </ul>
    )
}

function ContextMenuGeneral(props: { point: Point; onClose: () => void }) {
    const updateWorld = useEditorStore(x => x.updateWorld)

    function onCreateFlag() {
        props.onClose()

        updateWorld(world => {
            world.entities[generateUUID()] = {
                type: "flag",
                group: useEditorStore.getState().selectedGroup,

                bounds: {
                    bottom: 10,
                    left: -10,
                    right: 10,
                    top: -10,
                },
                capture: [-10, 10],
                size: LEVEL_SIZE,
                transform: {
                    point: props.point,
                    rotation: 0,
                },
            }
        })
    }

    function onCreateGravitation() {
        props.onClose()

        updateWorld(world => {
            world.entities[generateUUID()] = {
                type: "gravitation",
                group: useEditorStore.getState().selectedGroup,

                bounds: {
                    bottom: 10,
                    left: -10,
                    right: 10,
                    top: -10,
                },
                gravitation: {
                    x: 0,
                    y: -1,
                },
                transform: {
                    point: props.point,
                    rotation: 0,
                },
            }
        })
    }

    function onCreateRocket() {
        props.onClose()

        updateWorld(world => {
            world.entities[generateUUID()] = {
                type: "rocket",
                group: useEditorStore.getState().selectedGroup,

                size: ROCKET_SIZE,
                transform: {
                    point: props.point,
                    rotation: 0,
                },
            }
        })
    }

    function onCreateShape() {
        props.onClose()

        updateWorld(world => {
            world.entities[generateUUID()] = {
                type: "shape",
                group: useEditorStore.getState().selectedGroup,

                transform: {
                    point: props.point,
                    rotation: 0,
                },
                vertices: [
                    {
                        point: {
                            x: -2,
                            y: -2,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: -2,
                            y: 2,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: 2,
                            y: 2,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: 2,
                            y: -2,
                        },
                        color: 0xffffff,
                    },
                ],
            }
        })
    }

    return (
        <ul className="menu">
            <li>
                <a onClick={onCreateFlag}>
                    <FlagSvg width="16" height="16" />
                    Create Flag
                </a>
                <a onClick={onCreateGravitation}>
                    <ArrowUpDownSvg width="16" height="16" />
                    Create Gravitation Field
                </a>
                <a onClick={onCreateRocket}>
                    <RocketSvg width="16" height="16" />
                    Create Rocket
                </a>
                <a onClick={onCreateShape}>
                    <TriangleSvg width="16" height="16" />
                    Create Shape
                </a>
            </li>
        </ul>
    )
}
