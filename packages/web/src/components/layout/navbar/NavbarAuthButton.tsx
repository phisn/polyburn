import { useAuth } from "../../../common/hooks/UseAuth"
import { authService } from "../../../common/services/auth-service"
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
    const user = useAppStore(x => x.currentUser)

    switch (authService.getState()) {
        case AuthState.Unauthenticated:
            return (
                <AuthButtonRaw onClick={() => authApi.login()}>
                    <BoxArrowInRight width="32" height="32" className="pr-2" />
                </AuthButtonRaw>
            )

        case AuthState.Pending:
            return (
                <AuthButtonRaw className="btn-disabled">
                    <div className="loading loading-sm" />
                </AuthButtonRaw>
            )

        case AuthState.Authenticated:
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
