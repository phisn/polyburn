import { Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { shallow } from "zustand/shallow"
import { ArrowClockwise } from "../../../../common/components/inline-svg/ArrowClockwise"
import { ArrowCounterClockwise } from "../../../../common/components/inline-svg/ArrowCounterClockwise"
import { PlayFilled } from "../../../../common/components/inline-svg/PlayFilled"
import { useEditorStore } from "../../store/EditorStore"
import { NavbarMenu } from "./NavbarMenu"

export function EditorNavbar() {
    const run = useEditorStore(state => state.run)
    const [isPending, setPending] = useState(false)

    function onClickRun() {
        setPending(true)

        setTimeout(() => {
            run()
        }, 100)
    }

    return (
        <>
            <Transition
                show={isPending}
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 bg-opacity-50 backdrop-blur" />
            </Transition>
            <div className="bg-base-300 outline-base-200 absolute left-8 top-8 inline-flex rounded-lg bg-opacity-70 outline outline-1 backdrop-blur-2xl">
                <div className="flex space-x-2 rounded-2xl">
                    <NavbarMenu />
                    <UndoRedo />
                    <button className="btn btn-ghost btn-square" onClick={() => onClickRun()}>
                        <PlayFilled width="20" height="20" />
                    </button>
                </div>
            </div>
        </>
    )
}

function UndoRedo() {
    const [canUndo, canRedo, undo, redo] = useEditorStore(
        state => [state.canUndo, state.canRedo, state.undo, state.redo],
        shallow,
    )

    console.log("render undo/redo with", canUndo, canRedo, undo, redo, "mutation")

    return (
        <div className="join">
            <button
                className="join-item btn btn-square btn-ghost disabled:bg-base-300 disabled:text-base-200 bg-opacity-60 disabled:bg-opacity-0"
                disabled={!canUndo}
                onClick={undo}
            >
                <ArrowCounterClockwise width="20" height="20" />
            </button>
            <button
                className="join-item btn btn-square btn-ghost disabled:bg-base-300 disabled:text-base-200 bg-opacity-60 disabled:bg-opacity-0"
                disabled={!canRedo}
                onClick={redo}
            >
                <ArrowClockwise width="20" height="20" />
            </button>
        </div>
    )
}
