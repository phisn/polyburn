import { rocketComponents, RocketEntity } from "game/src/modules/module-rocket"
import { Frame, FramePacket } from "shared/src/lobby-api/frame-packet"
import {
    messageFromServer,
    UPDATE_POSITIONS_EVERY_MS,
    UpdateFromClient,
} from "shared/src/lobby-api/lobby-api"
import { UserOther } from "shared/src/lobby-api/user-other"
import { lerp } from "three/src/math/MathUtils"
import { Text } from "troika-three-text"
import { slerp } from "../../model/interpolation"
import { WebGameStore } from "../../model/store"
import { Rocket } from "../module-visual/objects/rocket"

export class OtherUserGhost {
    private packets: FramePacket[] = []
    private packetIterator = 0

    private mesh: Rocket

    private currentFrame: Frame | undefined
    private previousFrame: Frame | undefined

    constructor(
        private store: WebGameStore,
        private user: UserOther,
    ) {
        this.mesh = new Rocket(0.2)

        const text = new Text()

        text.text = user.username
        text.fontSize = 0.8
        text.color = "white"
        text.fillOpacity = 0.8
        text.position.y = 2
        text.textAlign = "center"
        text.anchorX = "center"
        text.anchorY = "bottom"

        this.mesh.add(text as any)

        this.store.scene.add(this.mesh)
    }

    dispose() {
        this.store.scene.remove(this.mesh)
    }

    addPacket(packet: FramePacket) {
        this.packets.push(packet)
    }

    onFixedUpdate() {
        // each packet consists of multiple positions. we always
        // work through the first packet and then remove it

        if (this.packets.length === 0) {
            return
        }

        if (this.packetIterator >= this.packets[0].frames.length) {
            this.packets.shift()
            this.packetIterator = 0
        }

        while (this.packets.length > 2) {
            this.packets.shift()
            this.packetIterator = 0
        }

        if (this.packets.length === 0) {
            return
        }

        this.previousFrame = this.currentFrame
        this.currentFrame = this.packets[0].frames[this.packetIterator]

        const dx = this.currentFrame.x - this.mesh.position.x
        const dy = this.currentFrame.y - this.mesh.position.y

        if (dx * dx + dy * dy > 4) {
            this.previousFrame = this.currentFrame
        }

        this.packetIterator++
    }

    onUpdate(overstep: number) {
        if (!this.previousFrame || !this.currentFrame) {
            return
        }

        const x = lerp(this.previousFrame.x, this.currentFrame.x, overstep)
        const y = lerp(this.previousFrame.y, this.currentFrame.y, overstep)
        const rotation = slerp(this.previousFrame.rotation, this.currentFrame.rotation, overstep)

        this.mesh.position.set(x, y, 0)
        this.mesh.rotation.z = rotation
    }

    getUser() {
        return this.user
    }
}

export class OtherUserGhosts {
    private ghosts: Map<string, OtherUserGhost>

    constructor(private store: WebGameStore) {
        this.ghosts = new Map()
    }

    addPackets(packets: FramePacket[]) {
        for (const packet of packets) {
            if (
                this.store.settings.instanceType === "play" &&
                this.store.settings?.lobby?.username === packet.username
            ) {
                continue
            }

            // console.log("Received packet: ", packet)

            const ghost = this.ghosts.get(packet.username)

            if (ghost) {
                ghost.addPacket(packet)
            }
        }
    }

    addPlayer(user: UserOther) {
        if (
            this.store.settings.instanceType === "play" &&
            this.store.settings?.lobby?.username === user.username
        ) {
            return
        }

        if (this.ghosts.has(user.username)) {
            return
        }

        this.ghosts.set(user.username, new OtherUserGhost(this.store, user))
    }

    removePlayer(username: string) {
        if (
            this.store.settings.instanceType === "play" &&
            this.store.settings?.lobby?.username === username
        ) {
            return
        }

        const ghost = this.ghosts.get(username)

        if (ghost) {
            const user = ghost.getUser()
            this.store.settings.hooks?.onUserLeft?.(user)

            ghost.dispose()
        }

        this.ghosts.delete(username)

        console.log("Removed player: ", username)
    }

    onFixedUpdate() {
        for (const ghost of this.ghosts.values()) {
            ghost.onFixedUpdate()
        }
    }

    onUpdate(overstep: number) {
        for (const ghost of this.ghosts.values()) {
            ghost.onUpdate(overstep)
        }
    }
}

export class ModuleLobby {
    private getRocket: () => RocketEntity

    private disposed = false
    private lastSend = 0
    private lastSetup: number
    private otherPlayers: OtherUserGhosts
    private packet: FramePacket
    private url: string
    private ws: WebSocket | undefined

    private setupEveryMs = 1000 * 30

    constructor(private store: WebGameStore) {
        if (store.settings.instanceType !== "play") {
            throw new Error("ModuleLobby can only be used in play mode")
        }

        if (store.settings.lobby === undefined) {
            throw new Error("ModuleLobby requires a user token")
        }

        const lobbyId = `${store.settings.worldname}-${store.settings.gamemode}`

        const url = new URL(`wss://${store.settings.lobby.host}/lobby`)
        url.searchParams.set("authorization", store.settings.lobby.token)
        url.searchParams.set("id", lobbyId)

        this.url = url.toString()

        this.otherPlayers = new OtherUserGhosts(store)

        this.lastSetup = Date.now()

        this.packet = {
            username: store.settings.lobby.username,
            frames: [],
        }

        this.getRocket = store.game.store.entities.single(...rocketComponents)
        this.lastSend = Date.now()

        const token = store.settings.lobby.token
        this.setup(token)
    }

    dispose() {
        this.ws?.close()
        this.disposed = true

        console.log("Disposed lobby module")
    }

    onFixedUpdate() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return
        }

        const rocket = this.getRocket()
        const body = rocket.get("body")

        this.otherPlayers.onFixedUpdate()

        this.packet.frames.push({
            x: body.translation().x,
            y: body.translation().y,
            rotation: body.rotation(),
        })

        const now = Date.now()

        if (now - this.lastSend > UPDATE_POSITIONS_EVERY_MS) {
            const message: UpdateFromClient = {
                type: "update",
                frames: this.packet.frames,
            }

            this.ws.send(JSON.stringify(message))

            this.packet.frames = []
            this.lastSend = now
        }
    }

    onUpdate(overstep: number) {
        this.otherPlayers.onUpdate(overstep)
    }

    private setup(token: string) {
        console.log("Setting up lobby websocket")
        this.lastSetup = Date.now()

        if (this.ws) {
            console.log("Closing previous lobby websocket")
            this.ws.close()
        }

        console.log("Connecting to lobby websocket at ", this.url)
        this.ws = new WebSocket(this.url)

        const previousWs = this.ws

        this.ws.onmessage = event => {
            const { error, data, success } = messageFromServer.safeParse(JSON.parse(event.data))

            if (success === false) {
                console.error("Lobby websocket invalid data: ", error)
                return
            }

            switch (data.type) {
                case "update":
                    for (const user of data.usersConnected) {
                        this.otherPlayers.addPlayer(user)
                        this.store.settings.hooks?.onUserJoined?.(user)
                    }

                    this.otherPlayers.addPackets(data.framePackets)

                    for (const user of data.usersDisconnected) {
                        this.otherPlayers.removePlayer(user.username)
                    }

                    break

                case "initialize":
                    for (const user of data.users) {
                        this.otherPlayers.addPlayer(user)
                    }

                    this.store.settings.hooks?.onConnected?.(data.users.length)

                    break
            }
        }

        this.ws.onopen = () => {
            console.log("Lobby websocket connected")
        }

        this.ws.onclose = event => {
            console.warn("Lobby websocket closed with reason: ", event.reason, event.code)

            this.store.settings.hooks?.onDisconnected?.()

            if (this.ws === previousWs) {
                this.rerunSetup(token)
            }
        }

        this.ws.onerror = error => {
            console.error("Lobby websocket failure: ", error)

            if (this.ws === previousWs) {
                this.rerunSetup(token)
            }
        }
    }

    private rerunSetup(token: string) {
        console.log("Reconnecting to lobby websocket")

        this.ws = undefined

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
