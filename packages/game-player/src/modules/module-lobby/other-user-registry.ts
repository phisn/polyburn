import { OtherUser } from "shared/src/lobby-api/other-user"
import { GamePlayerStore } from "../../model/store"
import { OtherUserGhost } from "./other-user-ghost"

export class OtherUserRegistry {
    private ghosts: Map<string, OtherUserGhost>

    constructor(private store: GamePlayerStore) {
        this.ghosts = new Map()
    }

    loadPackets(packets: FramePacket[]) {
        const lobbyConfig = this.store.resources.get("lobbyConfig")

        for (const packet of packets) {
            if (packet.username === lobbyConfig.username) {
                continue
            }

            const ghost = this.ghosts.get(packet.username)

            if (ghost) {
                ghost.loadPacket(packet)
            }
        }
    }

    addUser(user: OtherUser) {
        const lobbyConfig = this.store.resources.get("lobbyConfig")

        if (user.username === lobbyConfig.username) {
            return
        }

        if (this.ghosts.has(user.username)) {
            return
        }

        this.ghosts.set(user.username, new OtherUserGhost(this.store, user))
    }

    removeUser(username: string): boolean {
        const lobbyConfig = this.store.resources.get("lobbyConfig")

        if (username === lobbyConfig.username) {
            return false
        }

        const ghost = this.ghosts.get(username)

        if (ghost === undefined) {
            return false
        }

        ghost.dispose()
        this.ghosts.delete(username)

        return true
    }

    onFixedUpdate() {
        for (const ghost of this.ghosts.values()) {
            ghost.onFixedUpdate()
        }
    }
}
