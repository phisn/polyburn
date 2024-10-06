import { Dialog } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import { useAppStore } from "../../common/store/app-store"
import { trpcNative } from "../../common/trpc/trpc-native"
import { Modal } from "./Modal"

export function ModalRenameAccount(props: { open: boolean; onFinished: () => void }) {
    const usernameRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)

    const user = useAppStore(x => x.currentUser)
    const newAlert = useAppStore(x => x.newAlert)
    const updateUser = useAppStore(x => x.updateUser)

    useEffect(() => {
        if (user === undefined) {
            return
        }

        usernameRef.current!.value = user.username
    }, [user])

    async function onRename() {
        try {
            setLoading(true)

            const result = await trpcNative.user.rename.mutate({
                username: usernameRef.current!.value,
            })

            setLoading(false)

            if (result.message === "username-taken") {
                newAlert({
                    message: "Username is already taken",
                    type: "warning",
                })

                return
            }

            updateUser(await trpcNative.user.me.query())

            props.onFinished()
        } catch (error) {
            console.error(error)
            props.onFinished()
        }
    }

    return (
        <Modal open={props.open} closeDialog={() => props.onFinished()}>
            <div className="flex h-screen w-screen items-center justify-center">
                <Dialog.Panel className="bg-base-300 border-base-200 flex w-min flex-col rounded-xl border p-20">
                    <div className="w-auto pb-12 text-center text-xl">
                        {/* We couldn't find an account with this email. Would you like to create one? */}
                        {/* rename instead of create */}
                        Choose a new username
                    </div>
                    <div className="flex w-max space-x-2">
                        <label className="input input-bordered flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="h-4 w-4 opacity-70"
                            >
                                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                            </svg>
                            <input
                                ref={usernameRef}
                                type="text"
                                className="bg-base-100 grow"
                                placeholder="Username"
                            />
                        </label>
                        {loading === false && (
                            <div className="btn w-44" onClick={onRename}>
                                Rename
                            </div>
                        )}
                        {loading && (
                            <div className="btn w-44">
                                <div className="loading loading-xs" />
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Modal>
    )
}
