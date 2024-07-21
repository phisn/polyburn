export function newSvgFrom(children: JSX.Element, size: number = 16) {
    function Svg(props: { className?: string; width: string; height: string; fill?: string }) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={props.width}
                height={props.height}
                fill={props.fill || "currentColor"}
                className={props.className}
                viewBox={`0 0 ${size} ${size}`}
            >
                {children}
            </svg>
        )
    }

    return Svg
}
