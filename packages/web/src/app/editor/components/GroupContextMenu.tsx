import { Html } from "@react-three/drei"
import { useRef, useState } from "react"
import { Point } from "runtime/src/model/Point"
import { Vector3 } from "three"
import { ContextMenu } from "../../../common/components/ContextMenu"
import { BackArrowSvg } from "../../../common/components/inline-svg/BackArrow"
import { BoxArrowUpRightSvg } from "../../../common/components/inline-svg/BoxArrowUpRight"
import { ListTask } from "../../../common/components/inline-svg/ListTask"
import { X } from "../../../common/components/inline-svg/X"
import { entityClone } from "../entities/common-mutations/entity-clone"
import { entityRemove } from "../entities/common-mutations/entity-remove"
import { entitySetGroup } from "../entities/common-mutations/entity-set-group"
import { EntityState } from "../models/entity-state"
import { Priority } from "../models/priority"
import { WorldState } from "../models/world-state"
import { MutationGenerator, useEditorStore } from "../store/EditorStore"

export function EntityContextMenu(props: {
    state: EntityState
    position: Point
    onCancel: () => void
}) {
    const world = useEditorStore(store => store.state).world
    const dispatch = useEditorStore(store => store.mutation)

    return (
        <Html
            as="div"
            position={new Vector3(props.position.x, props.position.y, Priority.Selected + 0.01)}
        >
            <EntityContextMenuRaw
                world={world}
                dispatch={dispatch}
                onCancel={props.onCancel}
                state={props.state}
            />
        </Html>
    )
}

export function EntityContextMenuRaw(props: {
    world: WorldState
    dispatch: (mutation: MutationGenerator) => void
    onCancel: () => void

    state: EntityState
    children?: React.ReactNode
}) {
    const getInitialGroups = () => {
        const groups: string[] = []

        if (props.state.group) {
            groups.push(props.state.group)
        }

        groups.push(
            ...props.world.gamemodes
                .flatMap(gamemode => gamemode.groups)
                .filter(
                    (group, index, self) =>
                        self.indexOf(group) === index && group !== props.state.group,
                ),
        )

        return groups
    }

    const [groupMenu, setGroupMenu] = useState(false)
    const groupsRef = useRef<string[]>([])

    if (groupsRef.current.length === 0) {
        groupsRef.current = getInitialGroups()
    }

    return (
        <>
            {!groupMenu && (
                <ContextMenu>
                    <li>
                        <a onClick={() => setGroupMenu(true)}>
                            <ListTask width="16" height="16" />
                            <div>Group</div>
                        </a>
                    </li>
                    <li>
                        <a
                            onClick={() => {
                                props.dispatch(entityClone(props.state))
                                props.onCancel()
                            }}
                        >
                            <BoxArrowUpRightSvg width="16" height="16" />
                            <div>Clone</div>
                        </a>
                    </li>
                    <li>
                        <a
                            onClick={() => {
                                props.dispatch(entityRemove(props.state))
                                props.onCancel()
                            }}
                        >
                            <X width="16" height="16" className="scale-150 transform" />
                            <div>Remove</div>
                        </a>
                    </li>
                    {props.children}
                </ContextMenu>
            )}

            {groupMenu && groupsRef.current.length === 0 && (
                <div
                    className="bg-base-300 hover:bg-base-200 rounded-box box flex w-72 items-center space-x-4 bg-opacity-70 p-4 text-center backdrop-blur-xl transition hover:bg-opacity-70"
                    onClick={() => setGroupMenu(false)}
                >
                    <div>
                        <BackArrowSvg width="32" height="32" />
                    </div>
                    <div>
                        Create a group in the gamemode settings to add an group to this entity
                    </div>
                </div>
            )}
            {groupMenu && groupsRef.current.length > 0 && (
                <div className="bg-base-300 rounded-box bg-opacity-70 backdrop-blur-xl">
                    <div
                        className="btn btn-ghost grid grid-cols-3 rounded-2xl rounded-b-none text-sm"
                        onClick={() => setGroupMenu(false)}
                    >
                        <BackArrowSvg width="24" height="24" />
                        <div className="text-center">Groups</div>
                    </div>
                    <div className="divider -mb-2 -mt-2 p-0"></div>
                    <ul className="menu max-h-[20rem] min-w-[12rem] flex-nowrap overflow-scroll">
                        {groupsRef.current.map(group => (
                            <li key={group}>
                                <a
                                    className={`duration-250 transform transition-colors ${
                                        group === props.state.group &&
                                        "bg-success hover:bg-success rounded-lg text-black hover:bg-opacity-50 hover:text-black"
                                    }`}
                                    onClick={() => {
                                        if (props.state.group === group) {
                                            props.dispatch(entitySetGroup(props.state, undefined))
                                        } else {
                                            props.dispatch(entitySetGroup(props.state, group))
                                        }
                                    }}
                                >
                                    {group}
                                    {group === props.state.group && (
                                        <X
                                            width="16"
                                            height="16"
                                            className="ml-auto scale-150 transform"
                                        />
                                    )}
                                </a>

                                {/*
                                    {group !== props.state.group && (
                                        <a
                                            onClick={() =>
                                                props.dispatch(entitySetGroup(props.state, group))
                                            }
                                        >
                                            {group}
                                        </a>
                                    )}
                                    <Transition
                                        show={props.state.group === group}
                                        as="a"
                                        className="bg-success hover:bg-success rounded-lg text-black hover:bg-opacity-50 hover:text-black"
                                        onClick={() =>
                                            props.dispatch(entitySetGroup(props.state, undefined))
                                        }
                                        enter="transition duration-[400ms]"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                    >
                                        <X width="16" height="16" className="scale-150 transform" />
                                        {props.state.group}
                                    </Transition>
                                    */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}
