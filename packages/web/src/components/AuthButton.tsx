import React from "react"
import { useAuth } from "../common/hooks/UseAuth"
import { useAuthState } from "../common/hooks/use-auth-state"
import { useGlobalStore } from "../common/store"

function AuthButtonRaw(props: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}) {
    return (
        <div
            onClick={props.onClick}
            className={"btn btn-lg btn-square btn-ghost " + props.className}
        >
            <div className="flex items-center space-x-2">{props.children}</div>
        </div>
    )
}

export function AuthButton(props: {
    className?: string
    authenticated?: React.ReactNode
    unauthenticated?: React.ReactNode
}) {
    const authApi = useAuth()
    const authState = useAuthState()
    const user = useGlobalStore(x => x.currentUser)

    switch (authState) {
        case "unauthenticated":
            return (
                <AuthButtonRaw className={props.className} onClick={() => authApi.login()}>
                    {props.unauthenticated}
                </AuthButtonRaw>
            )

        case "fetching":
            return (
                <AuthButtonRaw className={`${props.className} btn-disabled`}>
                    <div className="loading loading-sm" />
                </AuthButtonRaw>
            )

        case "authenticated":
            return (
                <div className="flex items-center space-x-4">
                    <div className="font-outfit xs:flex hidden text-lg">{user?.username}</div>
                    <AuthButtonRaw className={props.className}>{props.authenticated}</AuthButtonRaw>
                </div>
            )
    }

    throw new Error("Unhandled auth state")
}
