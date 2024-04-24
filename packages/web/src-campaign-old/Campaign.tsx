import { WorldView } from "shared/src/views/world-view"
import { useModalView } from "../src/common/storage/use-modal-view"
import { useCampaignStore } from "./CampaignStore"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"
import { Player } from "./player-handlers/Player"

// TODO: implement loading screen later around game/players
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapier = import("@dimforge/rapier2d")

export function Campaign() {
    const worldSelected = useCampaignStore(state => state.worldSelected)
    const selectWorld = useCampaignStore(state => state.selectWorld)

    const handler = useCampaignStore(state => state.handlerSelected)
    const selectHandler = useCampaignStore(state => state.selectHandler)

    useModalView(worldSelected !== undefined && handler === undefined)

    function onWorldSelected(world: WorldView | undefined) {
        selectWorld(world)
        selectHandler(undefined)

        window.scrollTo(0, 0)
    }

    if (worldSelected && handler) {
        return <Player handler={handler} onCancel={() => onWorldSelected(undefined)} />
    }

    return (
        <>
            <WorldSelection onSelected={world => onWorldSelected(world)} />
            <GamemodeModal />
        </>
    )
}
