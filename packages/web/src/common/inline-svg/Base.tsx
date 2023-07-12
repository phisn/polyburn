export function newSvgFrom(children: JSX.Element) {
    return (props: {
        className?: string
        width: string
        height: string
        fill?: string
    }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.width}
            height={props.height}
            fill={props.fill || "currentColor"}
            className={props.className}
            viewBox="0 0 16 16"
        >
            {children}
        </svg>
    )
}
