import { WorldView } from "shared/src/views/world-view"
import { Modal, ModalPanel } from "../../common/components/Modal"
import { Gamemode } from "./Gamemode"

export function GamemodeModal(props: { worldview: WorldView | undefined; onUnselect(): void }) {
    return (
        <Modal
            open={props.worldview !== undefined}
            closeDialog={() => props.onUnselect()}
            className="flex items-center justify-center rounded-2xl p-6"
        >
            <div className="hxs:flex-col flex h-min w-full max-w-[40rem] flex-row">
                <div className="hxs:h-auto flex h-min justify-center justify-self-center p-6">
                    <div className="whitespace-nowrap text-xl text-white">
                        {props.worldview?.id.name}
                    </div>
                </div>

                <ModalPanel className="flex h-min w-full flex-col space-y-4 px-4">
                    {props.worldview &&
                        props.worldview.gamemodes.map((gamemode, i) => (
                            <Gamemode
                                key={i}
                                worldview={props.worldview!}
                                gamemodeview={gamemode}
                            />
                        ))}
                </ModalPanel>
                <div className="h-20" />
            </div>
        </Modal>
    )
}
