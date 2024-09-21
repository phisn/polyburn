import { GameStore } from "../model/store"

export class ModuleShape {
    constructor(private store: GameStore) {}

    onReset() {}
}
