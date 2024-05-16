import { EntityWith } from "runtime-framework"
import {
    Frame,
    FramePacket,
    OtherUser,
    UPDATE_POSITIONS_EVERY_MS,
    UpdateFromClient,
    messageFromServer,
} from "shared/src/websocket-api/lobby-api"
import { Text } from "troika-three-text"
import { ExtendedComponents } from "../../runtime-extension/extended-components"
import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"
import { lerp, slerp } from "../module-scene/module-scene"
import { Rocket } from "../module-scene/objects/rocket"

export class OtherUserGhost {
    private packets: FramePacket[] = []
    private packetIterator = 0

    private mesh: Rocket

    private currentFrame: Frame | undefined
    private previousFrame: Frame | undefined

    constructor(
        private runtime: ExtendedRuntime,
        private user: OtherUser,
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

        this.runtime.factoryContext.scene.add(this.mesh)
    }

    dispose() {
        this.runtime.factoryContext.scene.remove(this.mesh)
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

    constructor(private runtime: ExtendedRuntime) {
        this.ghosts = new Map()
    }

    addPackets(packets: FramePacket[]) {
        for (const packet of packets) {
            if (
                this.runtime.factoryContext.settings.instanceType === "play" &&
                this.runtime.factoryContext.settings?.user?.username === packet.username
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

    addPlayer(user: OtherUser) {
        if (
            this.runtime.factoryContext.settings.instanceType === "play" &&
            this.runtime.factoryContext.settings?.user?.username === user.username
        ) {
            return
        }

        if (this.ghosts.has(user.username)) {
            return
        }

        this.ghosts.set(user.username, new OtherUserGhost(this.runtime, user))
    }

    removePlayer(username: string) {
        if (
            this.runtime.factoryContext.settings.instanceType === "play" &&
            this.runtime.factoryContext.settings?.user?.username === username
        ) {
            return
        }

        const ghost = this.ghosts.get(username)

        if (ghost) {
            const user = ghost.getUser()
            this.runtime.factoryContext.settings.hooks?.onUserLeft?.(user)

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
    private packet: FramePacket
    private rocket: EntityWith<ExtendedComponents, "rocket" | "rigidBody">
    private lastSend = 0
    private ws: WebSocket | undefined
    private disposed = false

    private lastSetup: number
    private setupEveryMs = 1000 * 30

    private otherPlayers: OtherUserGhosts

    constructor(private runtime: ExtendedRuntime) {
        if (runtime.factoryContext.settings.instanceType !== "play") {
            throw new Error("ModuleLobby can only be used in play mode")
        }

        if (runtime.factoryContext.settings.user === undefined) {
            throw new Error("ModuleLobby requires a user token")
        }

        this.otherPlayers = new OtherUserGhosts(runtime)

        this.lastSetup = Date.now()

        this.packet = {
            username: runtime.factoryContext.settings.user.username,
            frames: [],
        }

        this.rocket = runtime.factoryContext.store.find("rocket", "rigidBody")[0]
        this.lastSend = Date.now()

        const token = runtime.factoryContext.settings.user.token
        this.setup(token)
    }

    dispose() {
        this.ws?.close()
        this.disposed = true
    }

    onFixedUpdate() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return
        }

        this.otherPlayers.onFixedUpdate()

        this.packet.frames.push({
            x: this.rocket.components.rigidBody.translation().x,
            y: this.rocket.components.rigidBody.translation().y,
            rotation: this.rocket.components.rigidBody.rotation(),
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
        this.lastSetup = Date.now()

        if (this.ws) {
            this.ws.close()
        }

        const lobbyId = `${this.runtime.factoryContext.settings.worldname}-${this.runtime.factoryContext.settings.gamemode}`

        const url = new URL("ws://localhost:3002/lobby")
        url.searchParams.set("authorization", token)
        url.searchParams.set("id", lobbyId)

        console.log("Connecting to lobby websocket at ", url.toString())
        this.ws = new WebSocket(url.toString())

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
                        this.runtime.factoryContext.settings.hooks?.onUserJoined?.(user)
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

                    this.runtime.factoryContext.settings.hooks?.onConnected?.(data.users.length)

                    break
            }
        }

        this.ws.onopen = () => {
            console.log("Lobby websocket connected")
        }

        this.ws.onclose = () => {
            console.warn("Lobby websocket closed")

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
