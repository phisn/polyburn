import { UPDATE_POSITIONS_EVERY_MS } from "shared/src/lobby-api/lobby-api"

const _RECEIVE_POS_TOLERANCE_MS = UPDATE_POSITIONS_EVERY_MS * 0.9

interface TrackerForUser {
    receivedLastAt: number
}

export class UserFrameTracker {
    private trackers: Map<string, TrackerForUser> = new Map()
    private packets: FramePacket[] = []

    trackPacket(packet: FramePacket) {
        let tracker = this.trackers.get(packet.username)

        if (!tracker) {
            tracker = {
                receivedLastAt: Date.now(),
            }
            this.trackers.set(packet.username, tracker)
        } else {
            /*
            if (Date.now() - tracker.receivedLastAt < RECEIVE_POS_TOLERANCE_MS) {
                return false
            }
            */
        }

        tracker.receivedLastAt = Date.now()
        this.packets.push(packet)

        return true
    }

    retrievePackets(): FramePacket[] {
        const temp = this.packets
        this.packets = []
        return temp
    }
}
