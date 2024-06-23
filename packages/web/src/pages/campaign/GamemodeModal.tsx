import { WorldInfo } from "../../../../shared/src/worker-api/world-info"
import { Modal, ModalPanel } from "../../components/modals/Modal"
import { Gamemode } from "./Gamemode"

export function GamemodeModal(props: { world: WorldInfo | undefined; onUnselect(): void }) {
    return (
        <Modal
            open={props.world !== undefined}
            closeDialog={() => props.onUnselect()}
            className="flex items-center justify-center rounded-2xl p-6"
        >
            <div className="hxs:flex-col flex h-min w-full max-w-[40rem] flex-row">
                <div className="hxs:h-auto flex h-min justify-center justify-self-center p-6">
                    <div className="whitespace-nowrap text-xl text-white">
                        {props.world?.id.name}
                    </div>
                </div>

                <ModalPanel className="flex h-min w-full flex-col space-y-4 px-4">
                    {props.world &&
                        props.world.gamemodes.map((gamemode, i) => (
                            <Gamemode key={i} world={props.world!} gamemodeview={gamemode} />
                        ))}
                </ModalPanel>
                <div className="h-20" />
            </div>
        </Modal>
    )
}
