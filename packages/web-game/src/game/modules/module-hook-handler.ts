import { WebGameStore } from "../model/store"

export class ModuleHookHandler {
    constructor(private runtime: WebGameStore) {
        runtime.game.store.events.listen({
            death: () => {},
        })
    }
}
