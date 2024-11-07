import { useGoogleLogin } from "@react-oauth/google"
import { useMemo, useState } from "react"
import { ModalCreateAccount } from "../../components/modals/ModalCreateAccount"
import { ModalRenameAccount } from "../../components/modals/ModalRenameAccount"
import { authService } from "../services/auth-service"
import { rpc } from "../services/rpc"
import { useGlobalStore } from "../store"

export interface AuthApi {
    login: () => void
    rename: () => void
}

export function useAuth(): AuthApi {
    const [loading, setLoading] = useState(false)

    const googleLogin = useGoogleLogin({
        onSuccess: async ({ code }) => {
            try {
                const response = await rpc.user.signin.$post({
                    json: {
                        code,
                    },
                })

                if (!response.ok) {
                    console.error("Failed to signin", response)

                    useGlobalStore.getState().newAlert({
                        type: "error",
                        message: `Failed to signin (${response.status})`,
                    })

                    setLoading(false)
                }

                const responseJson = await response.json()

                if (responseJson.type === "prompt-create") {
                    useGlobalStore.getState().newModal({
                        modal: function CreateModal() {
                            return (
                                <ModalCreateAccount
                                    creationJwt={responseJson.token}
                                    onCancel={() => {
                                        useGlobalStore.getState().removeModal()
                                        setLoading(false)
                                    }}
                                    onCreated={() => {
                                        useGlobalStore.getState().removeModal()
                                        setLoading(false)
                                    }}
                                />
                            )
                        },
                    })
                } else {
                    authService.login(responseJson.token)
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

    return useMemo(
        () => ({
            login() {
                setLoading(true)
                googleLogin()
            },
            rename() {
                useGlobalStore.getState().newModal({
                    modal: function RenameModal() {
                        return (
                            <ModalRenameAccount
                                open={true}
                                onFinished={() => {
                                    useGlobalStore.getState().removeModal()
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
}
