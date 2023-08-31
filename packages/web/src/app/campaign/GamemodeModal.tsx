import { useEffect, useState } from "react"
import { GamemodeView } from "shared/src/views/GamemodeView"
import { WorldView } from "shared/src/views/WorldView"
import { Modal, ModalPanel } from "../../common/components/Modal"
import { Gamemode } from "./Gamemode"

export function GamemodeModal(props: {
    openWithWorld: WorldView | undefined
    onSelected: (gamemode: GamemodeView) => void
    onCancel: () => void
}) {
    const [world, setWorld] = useState<WorldView | undefined>(props.openWithWorld)

    useEffect(() => {
        if (props.openWithWorld) {
            setWorld(props.openWithWorld)
        }
    }, [props.openWithWorld])

    /*
    const modes: GamemodeStats[] = [
        {
            name: "Normal",
            rank: { rank: "Diamond", time: "01:03.023", position: 41 },
        },
        {
            name: "Reverse",
            // rank: { rank: "Gold", time: "06:23.442", position: 355 },
        },
        { name: "Hard", locked: true },
        /*
        { name: "Low gravity", locked: true },
        { name: "Third Gamemode", locked: true },
        *
    ]
    */

    return (
        <Modal
            open={props.openWithWorld !== undefined}
            closeDialog={() => props.onCancel()}
            className="flex items-center justify-center rounded-2xl p-6"
        >
            <div className="hxs:flex-col flex h-min w-full max-w-[40rem] flex-row">
                <div className="hxs:h-auto flex h-min justify-center justify-self-center p-6">
                    <div className="whitespace-nowrap text-xl text-white">{world?.id.name}</div>
                </div>

                <ModalPanel className="flex h-min w-full flex-col space-y-4 px-4">
                    {world?.gamemodes.map((gamemode, i) => (
                        <Gamemode
                            key={i}
                            onSelected={() => props.onSelected(gamemode)}
                            gamemode={gamemode}
                        />
                    ))}
                </ModalPanel>
                <div className="h-20" />
            </div>
        </Modal>
    )
}
