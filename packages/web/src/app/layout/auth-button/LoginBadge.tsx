import { useAppStore } from "../../../common/storage/app-store"

export function LoginBadge(props: {
    loading: boolean
    onClickLogin: () => void
    onClickUser: () => void
}) {
    const user = useAppStore(x => x.user)

    if (props.loading) {
        return (
            <div className="btn btn-sm btn-primary btn-outline h-min w-20">
                <div className="loading loading-xs" />
            </div>
        )
    }

    if (user) {
        return (
            <div
                className="btn btn-sm btn-primary btn-outline h-min w-32"
                onClick={props.onClickUser}
            >
                Logged in as {user.username}
            </div>
        )
    }

    return (
        <div className="btn btn-sm btn-primary btn-outline h-min w-20" onClick={props.onClickLogin}>
            Login
        </div>
    )
}
