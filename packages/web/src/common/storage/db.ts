import Dexie, { Table } from "dexie"

interface ZustandKV {
    key: string
    value: string
}

class DB extends Dexie {
    zustand!: Table<ZustandKV, string>

    constructor() {
        super("rocket-game")

        this.version(1).stores({
            zustand: "key, value",
        })
    }
}

export const db = new DB()
