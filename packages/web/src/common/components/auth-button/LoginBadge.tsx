import { useAppStore } from "../../../common/storage/app-store"

// top-right className
// btn btn-sm btn-primary btn-outline h-min w-20
export function LoginBadge(props: {
    children: React.ReactNode
    loading: boolean
    onClickLogin: () => void
    onClickUser: () => void
    className?: string
}) {
    const user = useAppStore(x => x.user)

    if (props.loading) {
        return (
            <div className={props.className}>
                <div className="loading loading-xs" />
            </div>
        )
    }

    if (user) {
        return (
            <div className={props.className} onClick={props.onClickUser}>
                Logged in as {user.username}
            </div>
        )
    }

    return (
        <div className={props.className} onClick={props.onClickLogin}>
            {props.children}
        </div>
    )
}
