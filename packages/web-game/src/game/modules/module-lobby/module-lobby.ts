import { PositionsPacket, updateFromServer } from "shared/src/websocket-api/lobby-api"
import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"

export class OtherUsers {
    addPackets(packets: PositionsPacket[]) {}
    addPlayer(username: OtherUser) {}
    removePlayer(username: string) {}
}

export class ModuleLobby {
    private lastSetup: number
    private setupEveryMs = 1000 * 30

    private otherPlayers: OtherUsers

    constructor(runtime: ExtendedRuntime) {
        if (runtime.factoryContext.settings.instanceType !== "play") {
            throw new Error("ModuleLobby can only be used in play mode")
        }

        if (runtime.factoryContext.settings.userToken === undefined) {
            throw new Error("ModuleLobby requires a user token")
        }

        this.otherPlayers = new OtherUsers()

        this.lastSetup = Date.now()
        const token = runtime.factoryContext.settings.userToken
        this.setup(token)
    }

    private setup(token: string) {
        this.lastSetup = Date.now()

        console.log("Connecting to lobby websocket")
        const ws = new WebSocket(`ws://localhost:3002?authorization=${token}`)

        ws.onmessage = event => {
            const { data, success } = updateFromServer.safeParse(event.data)

            if (success === false) {
                console.error("Lobby websocket invalid data: ", data)
                return
            }

            switch (data.type) {
                case "serverUpdate":
                    for (const user of data.usersConnected) {
                        this.otherPlayers.addPlayer(user)
                    }

                    this.otherPlayers.addPackets(data.positionPackets)

                    for (const user of data.usersDisconnected) {
                        this.otherPlayers.removePlayer(user.username)
                    }

                    break
            }
        }

        ws.onopen = () => {
            console.log("Lobby websocket connected")
        }

        ws.onclose = () => {
            console.warn("Lobby websocket closed")
            this.rerunSetup(token)
        }

        ws.onerror = error => {
            console.error("Lobby websocket failure: ", error)
            this.rerunSetup(token)
        }
    }

    private rerunSetup(token: string) {
        const now = Date.now()

        if (now - this.lastSetup > this.setupEveryMs) {
            this.setup(token)
        } else {
            setTimeout(
                () => void this.rerunSetup(token),
                this.setupEveryMs - (now - this.lastSetup),
            )
        }
    }
}
