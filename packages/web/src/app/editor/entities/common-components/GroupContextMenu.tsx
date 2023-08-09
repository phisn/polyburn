import { Html } from "@react-three/drei"
import { useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { Vector3 } from "three"
import { ContextMenu } from "../../../../common/components/ContextMenu"
import { BackArrowSvg } from "../../../../common/components/inline-svg/BackArrow"
import { ListTask } from "../../../../common/components/inline-svg/ListTask"
import { X } from "../../../../common/components/inline-svg/X"
import { EntityState } from "../../models/EntityState"
import { WorldState } from "../../models/WorldState"
import { MutationGenerator, useEditorStore } from "../../store/EditorStore"
import { Priority } from "../../store/EventStore"
import { entityRemove } from "../common-mutations/entityRemove"
import { entitySetGroup } from "../common-mutations/entitySetGroup"

export function EntityContextMenu(props: { state: EntityState; position: Point }) {
    const world = useEditorStore(store => store.state).world
    const dispatch = useEditorStore(store => store.mutation)

    return (
        <Html
            as="div"
            position={new Vector3(props.position.x, props.position.y, Priority.Selected + 0.01)}
        >
            <EntityContextMenuRaw world={world} dispatch={dispatch} state={props.state} />
        </Html>
    )
}

export function EntityContextMenuRaw(props: {
    world: WorldState
    dispatch: (mutation: MutationGenerator) => void

    state: EntityState
    children?: React.ReactNode
}) {
    const groups = props.world.gamemodes
        .flatMap(gamemode => gamemode.groups)
        .filter(
            (group, index, self) => self.indexOf(group) === index && group !== props.state.group,
        )

    const [groupMenu, setGroupMenu] = useState(false)

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
                        <a onClick={() => props.dispatch(entityRemove(props.state))}>
                            <X width="16" height="16" className="scale-150 transform" />
                            <div>Remove</div>
                        </a>
                    </li>
                    {props.children}
                </ContextMenu>
            )}
            {groupMenu && (
                <div className="bg-base-300 rounded-box bg-opacity-70 backdrop-blur-2xl">
                    <div
                        className="btn btn-ghost grid grid-cols-3 rounded-2xl rounded-b-none text-sm"
                        onClick={() => setGroupMenu(false)}
                    >
                        <BackArrowSvg width="24" height="24" />
                        <div className="text-center">Groups</div>
                    </div>
                    <div className="divider -mb-2 -mt-2 p-0"></div>
                    <ul className="menu max-h-[20rem] min-w-[12rem] flex-nowrap overflow-scroll">
                        {props.state.group && (
                            <li className="">
                                <a
                                    className="bg-success hover:bg-success rounded-lg text-black hover:bg-opacity-50 hover:text-black"
                                    onClick={() =>
                                        props.dispatch(entitySetGroup(props.state, undefined))
                                    }
                                >
                                    <X width="16" height="16" className="scale-150 transform" />
                                    {props.state.group}
                                </a>
                            </li>
                        )}
                        {groups.map(group => (
                            <li>
                                <a
                                    onClick={() =>
                                        props.dispatch(entitySetGroup(props.state, group))
                                    }
                                >
                                    {group}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}
