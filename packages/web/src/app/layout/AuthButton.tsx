import { Dialog } from "@headlessui/react"
import { useGoogleLogin } from "@react-oauth/google"
import { useRef, useState } from "react"
import { Modal } from "../../common/components/Modal"
import { trpcNative } from "../../common/trpc/trpc-native"

type CreateAccountState =
    | false
    | {
          tokenForCreation: string
      }

type LoggedInState = false | { username: string }

export function AuthButton() {
    const usernameRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)
    const [loggedIn, setLoggedIn] = useState<LoggedInState>(false)
    const [createAccount, setCreateAccount] = useState<CreateAccountState>(false)

    const login = useGoogleLogin({
        onSuccess: ({ code }) => {
            trpcNative.googleAuth.getToken
                .query({ code })
                .then(response => {
                    if (response.type === "prompt-create") {
                        setCreateAccount({ tokenForCreation: response.tokenForCreation! })
                    } else {
                        console.log("response: json", JSON.stringify(response))
                        setLoggedIn({ username: response.username! })
                        setLoading(false)
                    }
                })
                .catch(() => {
                    setLoading(false)
                })
        },
        onError: () => {
            setLoading(false)
        },
        onNonOAuthError: () => {
            setLoading(false)
        },
        flow: "auth-code",
    })

    function onLogin() {
        setLoading(true)
        login()
    }

    function onCreate() {
        if (!createAccount) {
            return
        }

        trpcNative.googleAuth.create
            .query({
                tokenForCreation: createAccount.tokenForCreation,
                username: usernameRef.current!.value,
            })
            .then(() => {
                setLoggedIn({ username: usernameRef.current!.value })
                setLoading(false)
            })

        setCreateAccount(false)
    }

    return (
        <>
            <Modal
                open={!!createAccount}
                closeDialog={() => {
                    setCreateAccount(false)
                    setLoading(false)
                }}
            >
                <div className="flex h-screen w-screen items-center justify-center">
                    <Dialog.Panel className="bg-base-300 border-base-200 flex w-min flex-col rounded-xl border p-20">
                        <div className="w-auto pb-12 text-center text-xl">
                            We couldn't find an account with this email. Would you like to create
                            one?
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
                            <div className="btn" onClick={onCreate}>
                                Create Account
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Modal>
            {loggedIn && (
                <div className="btn btn-sm btn-primary btn-outline h-min w-32">
                    Logged in as {loggedIn.username}
                </div>
            )}
            {loading && (
                <div className="btn btn-sm btn-primary btn-outline h-min w-20">
                    <div className="loading loading-xs" />
                </div>
            )}
            {!loading && !loggedIn && (
                <div className="btn btn-sm btn-primary btn-outline h-min w-20" onClick={onLogin}>
                    Login
                </div>
            )}
        </>
    )
}
