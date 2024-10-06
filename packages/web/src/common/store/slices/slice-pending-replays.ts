import { StateCreator } from "zustand"
import { AppStore } from "../app-store"

export interface PendingReplaysSlice {
    pendingReplays: PendingReplay[]
    uploadPendingReplays(): void
}

export interface PendingReplay {
    createdAt: number
    createdBy?: string
    failureCount: number
    gamemode: string
    replayModelBase64: string
    worldname: string
}

export const pendingReplaysSlice: StateCreator<AppStore, [], [], PendingReplaysSlice> = (
    set,
    get,
) => ({
    pendingReplays: [],
    uploadPendingReplays: async () => {
        const currentUser = get().currentUser

        if (currentUser === undefined) {
            return
        }

        const replaysToProcess = get().pendingReplays.filter(
            replay => replay.createdBy === undefined || replay.createdBy === currentUser.username,
        )

        const pendingReplays: PendingReplay[] = get().pendingReplays.filter(
            replay => replay.createdBy !== undefined && replay.createdBy !== currentUser.username,
        )

        for (const replay of replaysToProcess) {
            try {
                /*
                const result = await trpcNative.validateReplay.mutate({
                    gamemode: replay.gamemode,
                    replayModelBase64: replay.replayModelBase64,
                    worldname: replay.worldname,
                })

                get().newAlert({
                    type: "info",
                    message: `Replay for ${replay.worldname} ${replay.gamemode} with rank ${result.rank} uploaded successfully`,
                })

                */
            } catch (e) {
                replay.failureCount++

                const retries = 5
                const timespanWeek = 1000 * 60 * 60 * 24 * 7

                if (replay.failureCount < retries || replay.createdAt < Date.now() - timespanWeek) {
                    pendingReplays.push(replay)
                }

                console.error("Failed to upload replay", replay, e)
            }
        }

        set({
            pendingReplays,
        })
    },
})
