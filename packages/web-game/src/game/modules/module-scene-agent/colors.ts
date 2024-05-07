export interface AgentColors {
    rocket: number
    flagCaptureRegion: number
    shape: number
    outOfBounds: number
}

export const agentColorsRGB: AgentColors = {
    rocket: 0x00ff00,
    flagCaptureRegion: 0x0000ff,
    shape: 0xff0000,
    outOfBounds: 0xff0000,
}

export const agentColorsGrayScale: AgentColors = {
    rocket: 0xdddddd,
    flagCaptureRegion: 0x333333,
    shape: 0xffffff,
    outOfBounds: 0xffffff,
}
