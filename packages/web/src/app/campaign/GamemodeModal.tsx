import { useEffect, useState } from "react"
import { WorldView } from "shared/src/views/WorldView"
import { Modal, ModalPanel } from "../../common/components/Modal"
import { useCampaignStore } from "./CampaignStore"
import { Gamemode } from "./Gamemode"

export function GamemodeModal() {
    const worldSelected = useCampaignStore(state => state.worldSelected)
    const cancelGamemodeSelection = useCampaignStore(state => state.cancelGamemodeSelection)

    const [world, setWorld] = useState<WorldView | undefined>(worldSelected)

    useEffect(() => {
        if (worldSelected) {
            setWorld(worldSelected)
        }
    }, [worldSelected])

    return (
        <Modal
            open={worldSelected !== undefined}
            closeDialog={() => cancelGamemodeSelection()}
            className="flex items-center justify-center rounded-2xl p-6"
        >
            <div className="hxs:flex-col flex h-min w-full max-w-[40rem] flex-row">
                <div className="hxs:h-auto flex h-min justify-center justify-self-center p-6">
                    <div className="whitespace-nowrap text-xl text-white">{world?.id.name}</div>
                </div>

                <ModalPanel className="flex h-min w-full flex-col space-y-4 px-4">
                    {world?.gamemodes.map((gamemode, i) => (
                        <Gamemode key={i} gamemode={gamemode} />
                    ))}
                </ModalPanel>
                <div className="h-20" />
            </div>
        </Modal>
    )
}
