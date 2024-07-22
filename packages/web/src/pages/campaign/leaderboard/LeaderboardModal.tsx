import { GamemodeInfo } from "shared/src/worker-api/gamemode-info"
import { WorldInfo } from "shared/src/worker-api/world-info"
import { Modal, ModalPanel } from "../../../components/modals/Modal"
import { Leaderboard } from "./Leaderboard"

export function LeaderboardModal(props: {
    open: boolean
    world: WorldInfo
    gamemode: GamemodeInfo
    closeDialog: () => void
}) {
    return (
        <Modal
            open={props.open}
            closeDialog={() => {
                console.log("close leaderboard")
                props.closeDialog()
            }}
            className="hmd:py-20 flex h-full items-center justify-center rounded-2xl p-6"
        >
            <ModalPanel className="flex h-full w-full max-w-[32rem] flex-col items-center space-y-4">
                <div className="justify-center text-lg">Leaderboard</div>
                <Leaderboard
                    world={props.world}
                    gamemode={props.gamemode}
                    closeDialog={props.closeDialog}
                />
            </ModalPanel>
        </Modal>
    )
}
