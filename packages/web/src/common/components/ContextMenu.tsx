export function ContextMenu(props: { className?: string; children?: React.ReactNode }) {
    return (
        <ul
            className={
                "menu bg-base-300 rounded-box min-w-[12rem] bg-opacity-70 backdrop-blur-xl " +
                props.className
            }
            onContextMenu={e => e.preventDefault()}
        >
            {props.children}
        </ul>
    )
}
