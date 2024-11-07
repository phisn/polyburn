import { useAuthState } from "../../../common/hooks/use-auth-state"
import { useAuth } from "../../../common/hooks/UseAuth"
import { useGlobalStore } from "../../../common/store"
import { BoxArrowInRight } from "../../common/svg/BoxArrowInRight"
import { Person } from "../../common/svg/Person"

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

export function NavbarAuthButton() {
    const authApi = useAuth()
    const authState = useAuthState()
    const user = useGlobalStore(x => x.currentUser)

    switch (authState) {
        case "unauthenticated":
            return (
                <AuthButtonRaw onClick={() => authApi.login()}>
                    <BoxArrowInRight width="32" height="32" className="pr-2" />
                </AuthButtonRaw>
            )

        case "fetching":
            return (
                <AuthButtonRaw className="btn-disabled">
                    <div className="loading loading-sm" />
                </AuthButtonRaw>
            )

        case "authenticated":
            return (
                <div className="flex items-center space-x-4">
                    <div className="font-outfit xs:flex hidden text-lg">{user?.username}</div>
                    <AuthButtonRaw onClick={() => authApi.rename()}>
                        <Person width="24" height="24" />
                    </AuthButtonRaw>
                </div>
            )
    }

    throw new Error("Unhandled auth state")
}
