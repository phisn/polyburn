import { Object3D } from "three"
import { Text } from "troika-three-text"

export class Timer extends Object3D {
    private ticks = 0
    private text = new Text()

    constructor() {
        super()

        this.text.text = formatTicks(this.ticks)
        this.text.fontSize = 0.1
        this.text.color = 0xffffff
        this.text.anchorX = "center"
        this.text.anchorY = "middle"
        this.text.outlineColor = 0
        this.text.outlineWidth = 0.003

        this.text.material.depthTest = false
        this.text.material.depthWrite = false

        this.text.frustumCulled = false

        this.add(this.text)
        this.position.set(0, -0.85, 0)
    }

    onFixedUpdate() {
        this.ticks += 1
        this.text.text = formatTicks(this.ticks)
    }
}

function formatTicks(ticks: number) {
    const totalSeconds = ticks / 60
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const hundredths = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 10)

    // Pad numbers with leading zeros if necessary
    const paddedHours = String(hours).padStart(2, "0")
    const paddedMinutes = String(minutes).padStart(2, "0")
    const paddedSeconds = String(seconds).padStart(2, "0")
    const paddedHundredths = String(hundredths).padStart(1, "0")

    let base = ""

    if (hours > 0) {
        base += `${paddedHours}:`
    }

    return `${base}${paddedMinutes}:${paddedSeconds}.${paddedHundredths}`
}
