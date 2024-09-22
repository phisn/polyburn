import { WebGameStore } from "../model/store"

export class ModuleHookHandler {
    constructor(private store: WebGameStore) {
        store.game.store.events.listen({
            finished: () => {
                store.settings.hooks?.onFinished?.()
            },
        })
    }
}
