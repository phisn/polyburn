import { useGoogleLogin } from "@react-oauth/google"
import { useMemo, useState } from "react"
import { ModalCreateAccount } from "../../components/modals/ModalCreateAccount"
import { ModalRenameAccount } from "../../components/modals/ModalRenameAccount"
import { useAppStore } from "../store/app-store"
import { trpcNative } from "../trpc/trpc-native"

export enum AuthState {
    Unauthenticated = "unauthenticated",
    Authenticated = "authenticated",
    Pending = "pending",
}

export interface AuthApi {
    login: () => void
    rename: () => void
}

export function useAuth(): [AuthState, AuthApi] {
    const [me, jwt, hasHydrated] = useAppStore(state => [state.user, state.jwt, state.hydrated])
    const [loading, setLoading] = useState(false)

    const googleLogin = useGoogleLogin({
        onSuccess: async ({ code }) => {
            try {
                const response = await trpcNative.user.getToken.query({ code })

                if (response.type === "prompt-create") {
                    useAppStore.getState().newModal({
                        modal: function CreateModal() {
                            return (
                                <ModalCreateAccount
                                    creationJwt={response.tokenForCreation}
                                    onCancel={() => {
                                        useAppStore.getState().removeModal()
                                        setLoading(false)
                                    }}
                                    onCreated={() => {
                                        useAppStore.getState().removeModal()
                                        setLoading(false)
                                    }}
                                />
                            )
                        },
                    })
                } else {
                    const me = await trpcNative.user.me.query()

                    useAppStore.getState().updateJwt(response.token)
                    useAppStore.getState().updateUser(me)

                    setLoading(false)
                }
            } catch (error) {
                console.error(error)
                setLoading(false)
            }
        },
        onError: error => {
            console.error(error)
            setLoading(false)
        },
        onNonOAuthError: error => {
            console.error(error)
            setLoading(false)
        },
        flow: "auth-code",
    })

    const api = useMemo(
        () => ({
            login() {
                setLoading(true)
                googleLogin()
            },
            rename() {
                useAppStore.getState().newModal({
                    modal: function RenameModal() {
                        return (
                            <ModalRenameAccount
                                open={true}
                                onFinished={() => {
                                    useAppStore.getState().removeModal()
                                    setLoading(false)
                                }}
                            />
                        )
                    },
                })

                setLoading(true)
            },
        }),
        [googleLogin],
    )

    if ((jwt && !me) || loading || hasHydrated === false) {
        return [AuthState.Pending, api]
    }

    if (me) {
        return [AuthState.Authenticated, api]
    }

    return [AuthState.Unauthenticated, api]
}
