import { TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { AppRouter } from "../../../../server/src/worker/framework/trpc-router"
import { useAppStore } from "../store/app-store"

// link to synchronize authentication status with the server. If requests fails with
// a 401 status code, the user will be logged out.

export const authSyncLink: TRPCLink<AppRouter> =
    () =>
    ({ next, op }) =>
        observable(observer =>
            next(op).subscribe({
                next(value) {
                    observer.next(value)
                },
                error(err) {
                    if (err.data?.code === "UNAUTHORIZED") {
                        const appStore = useAppStore.getState()
                        appStore.logout()

                        console.log("Logged out due to 401 status code")
                    }

                    observer.error(err)
                },
                complete() {
                    observer.complete()
                },
            }),
        )
