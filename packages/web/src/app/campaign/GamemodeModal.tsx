import { useEffect, useState } from "react"
import { Modal } from "../../common/components/Modal"
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
            name: "Hard",
            rank: { rank: "Gold", time: "06:23.442", position: 355 },
        },
        { name: "Reverse" },
        { name: "Low gravity", locked: true },
        { name: "Third Gamemode", locked: true },
    ]

    return (
        <Modal open={props.openWithWorld !== undefined} closeDialog={() => props.onCancel()}>
            <div className="mb-20 grid w-screen max-w-[32rem] gap-6 rounded-2xl bg-white bg-opacity-5 p-4 shadow-2xl backdrop-blur-2xl">
                <div className="flex justify-self-center backdrop-blur-2xl">
                    <div className="text-xl text-white">{worldInfo?.name}</div>
                </div>
                {modes.map((gamemode, i) => (
                    <Gamemode key={i} onClick={() => props.onSelected(gamemode)} {...gamemode} />
                ))}
            </div>
        </Modal>
    )
}
