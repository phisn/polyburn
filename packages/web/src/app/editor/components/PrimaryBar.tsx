import { ArrowClockwise } from "../../../common/components/inline-svg/ArrowClockwise"
import { ArrowCounterClockwise } from "../../../common/components/inline-svg/ArrowCounterClockwise"
import { List } from "../../../common/components/inline-svg/List"
import { PlayFilled } from "../../../common/components/inline-svg/PlayFilled"
import { useCanUndoRedo, useMutationDispatch } from "../store/WorldStore"

export function PrimaryBar() {
    return (
        <div className="absolute left-8 top-8 inline-flex rounded-lg bg-black bg-opacity-40 backdrop-blur-2xl">
            <div className="flex space-x-2 rounded-2xl">
                <button className="btn btn-ghost btn-square">
                    <List width="22" height="22" />
                </button>
                <UndoRedo />
                <button className="btn btn-ghost btn-square">
                    <PlayFilled width="20" height="20" />
                </button>
            </div>
        </div>
    )
}

function UndoRedo() {
    const [canUndo, canRedo] = useCanUndoRedo()
    const dispatch = useMutationDispatch()

    return (
        <div className="join">
            <button
                className="join-item btn btn-square btn-ghost bg-opacity-60"
                disabled={!canUndo}
                onClick={() => dispatch("undo")}
            >
                <ArrowCounterClockwise width="20" height="20" />
            </button>
            <button
                className="join-item btn btn-square btn-ghost bg-opacity-60"
                disabled={!canRedo}
                onClick={() => dispatch("redo")}
            >
                <ArrowClockwise width="20" height="20" />
            </button>
        </div>
    )
}
