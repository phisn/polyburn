import { slerp } from "game/src/model/utils"
import { Frame, FramePacket } from "shared/src/lobby-api/frame-packet"
import { OtherUser } from "shared/src/lobby-api/other-user"
import { lerp } from "three/src/math/MathUtils"
import { Text } from "troika-three-text"
import { GamePlayerStore } from "../../model/store"
import { Rocket } from "../module-visual/objects/rocket"

export class OtherUserGhost {
    private packets: FramePacket[] = []
    private packetIterator = 0

    private mesh: Rocket

    private currentFrame: Frame | undefined
    private previousFrame: Frame | undefined

    constructor(
        private store: GamePlayerStore,
        private otherUser: OtherUser,
    ) {
        this.mesh = new Rocket(0.2)

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

        const scene = this.store.resources.get("scene")
        scene.add(this.mesh)
    }

    dispose() {
        const scene = this.store.resources.get("scene")
        scene.remove(this.mesh)
    }

    addPacket(packet: FramePacket) {
        this.packets.push(packet)
    }

    onFixedUpdate(last: Boolean) {
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

    getOtherUser() {
        return this.otherUser
    }
}
