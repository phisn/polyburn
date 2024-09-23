import { GamePlayerStore } from "../model/store"

export class ModuleHookHandler {
    constructor(private store: GamePlayerStore) {
        store.game.store.events.listen({
            finished: () => {
                store.settings.hooks?.onFinished?.()
            },
        })
    }
}
