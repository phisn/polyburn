import { rocketComponents, RocketEntity } from "game/src/modules/module-rocket"
import { FramePacket } from "shared/src/lobby-api/frame-packet"
import { lobbyId, UPDATE_POSITIONS_EVERY_MS } from "shared/src/lobby-api/lobby-api"
import { ClientUpdateMessage } from "shared/src/lobby-api/message-client"
import { serverMessage } from "shared/src/lobby-api/message-server"
import { GamePlayerStore } from "../../model/store"
import { OtherUserRegistry } from "./other-user-registry"

export interface LobbyConfigResource {
    lobbyWsUrl: string
    token: string
    username: string
}

export class ModuleLobby {
    private getRocket: () => RocketEntity

    private currentPacket: FramePacket
    private timeSinceUpdate: number
    private otherUserRegistry: OtherUserRegistry
    private ws: WebSocket | undefined
    private wsUrl: string

    private baseFailureTimeout = 1000
    private failureCounter = 0

    constructor(private store: GamePlayerStore) {
        const lobbyConfig = store.resources.get("lobbyConfig")
        const config = store.resources.get("config")

        const wsUrl = new URL(lobbyConfig.lobbyWsUrl)
        wsUrl.searchParams.set("authorization", lobbyConfig.token)
        wsUrl.searchParams.set("id", lobbyId(config.worldname, config.gamemode))

        this.wsUrl = wsUrl.toString()
        this.otherUserRegistry = new OtherUserRegistry(store)

        this.currentPacket = {
            username: lobbyConfig.username,
            frames: [],
        }

        this.getRocket = store.game.store.entities.single(...rocketComponents)
        this.timeSinceUpdate = Date.now()

        this.startWebsocket()
    }

    onDispose() {
        this.ws?.close()
    }

    onFixedUpdate() {
        const rocket = this.getRocket()
        const body = rocket.get("body")

        this.otherUserRegistry.onFixedUpdate()

        this.currentPacket.frames.push({
            x: body.translation().x,
            y: body.translation().y,
            rotation: body.rotation(),
        })

        if (Date.now() - this.timeSinceUpdate > UPDATE_POSITIONS_EVERY_MS) {
            if (this.ws?.readyState === WebSocket.OPEN) {
                const message: ClientUpdateMessage = {
                    type: "update",
                    frames: this.currentPacket.frames,
                }

                this.ws?.send(JSON.stringify(message))
            }

            this.currentPacket.frames = []
            this.timeSinceUpdate = Date.now()
        }
    }

    private startWebsocket() {
        this.ws?.close()
        this.ws = new WebSocket(this.wsUrl)

        const previousWs = this.ws

        this.ws.onmessage = event => {
            const { error, data, success } = serverMessage.safeParse(JSON.parse(event.data))

            if (success === false) {
                console.error("Lobby websocket invalid data: ", error)
                return
            }

            switch (data.type) {
                case "update":
                    for (const user of data.usersConnected) {
                        this.otherUserRegistry.addUser(user)
                        this.store.events.invoke.lobbyJoin?.(user)
                    }

                    for (const user of data.usersDisconnected) {
                        this.otherUserRegistry.removeUser(user.username)
                        this.store.events.invoke.lobbyLeave?.(user)
                    }

                    this.otherUserRegistry.loadPackets(data.framePackets)

                    break
                case "initialize":
                    for (const user of data.users) {
                        this.otherUserRegistry.addUser(user)
                    }

                    this.store.events.invoke.lobbyConnected?.(data.users)

                    break
            }
        }

        this.ws.onopen = () => {
            console.log("Lobby websocket connected")
        }

        this.ws.onclose = event => {
            console.warn("Lobby websocket closed with reason: ", event.reason, event.code)

            this.store.events.invoke.lobbyDisconnected?.()
            if (this.ws === previousWs) {
                this.failureCounter++
                this.restartWebsocket()
            }
        }

        this.ws.onerror = error => {
            console.error("Lobby websocket failure: ", error)

            if (this.ws === previousWs) {
                this.failureCounter++
                this.restartWebsocket()
            }
        }
    }

    private restartWebsocket() {
        console.log("Reconnecting to lobby websocket")

        this.ws?.close()
        this.ws = undefined

        setTimeout(() => this.startWebsocket(), this.baseFailureTimeout)
    }
}
