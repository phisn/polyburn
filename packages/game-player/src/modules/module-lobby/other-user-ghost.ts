import { Frame, FramePacket } from "shared/src/lobby-api/frame-packet"
import { OtherUser } from "shared/src/lobby-api/other-user"
import { Object3D } from "three"
import { Text } from "troika-three-text"
import { GamePlayerStore } from "../../model/store"
import { Rocket } from "../module-visual/objects/rocket"

export class OtherUserGhost {
    private currentFrame: Frame
    private mesh: Object3D
    private packets: FramePacket[] = []
    private packetIterator: number
    private resetInterpolation: () => void

    constructor(
        private store: GamePlayerStore,
        private otherUser: OtherUser,
    ) {
        this.mesh = new Rocket(0.2)
        this.currentFrame = {
            x: Infinity,
            y: Infinity,
            rotation: Infinity,
        }
        this.packetIterator = 0

        const text = new Text()
        text.text = otherUser.username
        text.fontSize = 0.8
        text.color = "white"
        text.fillOpacity = 0.8
        text.position.y = 2
        text.textAlign = "center"
        text.anchorX = "center"
        text.anchorY = "bottom"
        this.mesh.add(text as any)

        const interpolation = this.store.resources.get("interpolation")
        const scene = this.store.resources.get("scene")

        scene.add(this.mesh)

        const registration = interpolation.register(this.mesh, () => ({
            point: {
                x: this.currentFrame.x,
                y: this.currentFrame.y,
            },
            rotation: this.currentFrame.rotation,
        }))
        this.resetInterpolation = registration.reset
    }

    dispose() {
        const scene = this.store.resources.get("scene")
        scene.remove(this.mesh)
    }

    loadPacket(packet: FramePacket) {
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

        this.currentFrame = this.packets[0].frames[this.packetIterator]

        const dx = this.currentFrame.x - this.mesh.position.x
        const dy = this.currentFrame.y - this.mesh.position.y

        if (dx * dx + dy * dy > 4) {
            this.resetInterpolation()
        }

        this.packetIterator++
    }

    getOtherUser() {
        return this.otherUser
    }
}
