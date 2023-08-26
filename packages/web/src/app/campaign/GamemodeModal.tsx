import { useEffect, useState } from "react"
import { Modal, ModalPanel } from "../../common/components/Modal"
import { Gamemode, GamemodeStats } from "./Gamemode"
import { WorldInfo } from "./World"

export function GamemodeModal(props: {
    openWithWorld: WorldInfo | undefined
    onSelected: (gamemode: GamemodeStats) => void
    onCancel: () => void
}) {
    const [worldInfo, setWorldInfo] = useState<WorldInfo | undefined>(props.openWithWorld)

    useEffect(() => {
        if (props.openWithWorld) {
            setWorldInfo(props.openWithWorld)
        }
    }, [props.openWithWorld])

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
        */
    ]

    console.log(worldInfo)

    return (
        <Modal
            open={props.openWithWorld !== undefined}
            closeDialog={() => props.onCancel()}
            className="flex items-center justify-center rounded-2xl p-6"
        >
            <div className="hxs:flex-col flex h-min w-full max-w-[40rem] flex-row">
                <div className="hxs:h-auto flex h-min justify-center justify-self-center p-6">
                    <div className="whitespace-nowrap text-xl text-white">{worldInfo?.name}</div>
                </div>

                <ModalPanel className="flex h-min w-full flex-col space-y-4 px-4">
                    {modes.map((gamemode, i) => (
                        <Gamemode
                            key={i}
                            onClick={() => props.onSelected(gamemode)}
                            {...gamemode}
                        />
                    ))}
                </ModalPanel>
            </div>
        </Modal>
    )
}
