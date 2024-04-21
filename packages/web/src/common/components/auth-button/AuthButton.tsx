import { useGoogleLogin } from "@react-oauth/google"
import { useEffect, useState } from "react"
import { useAppStore } from "../../../common/storage/app-store"
import { trpcNative } from "../../../common/trpc/trpc-native"
import { CreateAccount } from "./CreateAccount"
import { LoginBadge } from "./LoginBadge"
import { RenameAccount } from "./RenameAccount"

export function AuthButton(props: { children: React.ReactNode; className?: string }) {
    const [creationJwt, setCreationJwt] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [renaming, setRenaming] = useState(false)

    const updateJwt = useAppStore(x => x.updateJwt)
    const updateUser = useAppStore(x => x.updateUser)

    useEffect(() => {
        setTimeout(() => {
            const jwt = useAppStore.getState().jwt

            if (jwt) {
                console.log("jwt", jwt)
                setLoading(true)
                trpcNative.user.me
                    .query()
                    .then(user => {
                        updateUser(user)
                        setLoading(false)
                    })
                    .catch(error => {
                        console.error(error)
                        setLoading(false)
                    })
            } else {
                console.log("no jwt")
            }
        }, 100)
    }, [updateUser])

    const login = useGoogleLogin({
        onSuccess: async ({ code }) => {
            try {
                const response = await trpcNative.user.getToken.query({ code })

                if (response.type === "prompt-create") {
                    console.log("prompt-create")
                    setCreationJwt(response.tokenForCreation)
                } else {
                    updateJwt(response.token)
                    updateUser(await trpcNative.user.me.query())

                    setLoading(false)
                }
            } catch (error) {
                console.error(error)
                setLoading(false)
            }
        },
        onError: () => {
            setLoading(false)
        },
        onNonOAuthError: () => {
            setLoading(false)
        },
        flow: "auth-code",
    })

    async function onLogin() {
        setLoading(true)
        login()
    }

    async function onRename() {
        setRenaming(true)
        setLoading(true)
    }

    async function onRenameFinished() {
        setRenaming(false)
        setLoading(false)
    }

    async function onCreateFinished() {
        setCreationJwt(undefined)
        setLoading(false)
    }

    return (
        <>
            <LoginBadge
                loading={loading}
                onClickLogin={onLogin}
                onClickUser={onRename}
                className={props.className}
            >
                {props.children}
            </LoginBadge>

            <CreateAccount
                creationJwt={creationJwt}
                onCancel={onCreateFinished}
                onCreated={onCreateFinished}
            />

            <RenameAccount open={renaming} onFinished={onRenameFinished} />
        </>
    )
}
