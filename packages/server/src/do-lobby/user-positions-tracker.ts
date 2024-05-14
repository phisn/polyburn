import { TRPCError } from "@trpc/server"
import { Point } from "runtime/src/model/point"
import { PositionsPacket, UPDATE_POSITIONS_EVERY_MS } from "shared/src/websocket-api/lobby-api"

const RECEIVE_POS_TOLERANCE_MS = UPDATE_POSITIONS_EVERY_MS * 0.9

interface TrackerForUser {
    receivedLastAt: number
}

export class UserPositionTracker {
    private trackers: Map<string, TrackerForUser> = new Map()
    private packets: PositionsPacket[] = []

    addPositions(username: string, positions: Point[]) {
        let tracker = this.trackers.get(username)

        if (!tracker) {
            tracker = {
                receivedLastAt: Date.now(),
            }
            this.trackers.set(username, tracker)
        } else {
            if (Date.now() - tracker.receivedLastAt < RECEIVE_POS_TOLERANCE_MS) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "Too many updates",
                })
            }
        }

        tracker.receivedLastAt = Date.now()

        const packet: PositionsPacket = {
            username,
            positions,
        }

        this.packets.push(packet)
    }

    retrievePackets(): PositionsPacket[] {
        const temp = this.packets
        this.packets = []
        return temp
    }
}
