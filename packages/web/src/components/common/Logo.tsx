export function LogoWithText() {
    return (
        <div className="font-outfit flex h-min flex-initial items-center justify-center text-3xl">
            <Logo />
            <div className="xs:flex hidden">
                Poly<div className="text-red-400">burn</div>
            </div>
        </div>
    )
}

export function Logo(props: { className?: string }) {
    return (
        <svg
            className={"mx-2 " + props.className}
            xmlns="http://www.w3.org/2000/svg"
            id="eVjCW2NZqmM1"
            width={20}
            height={20}
            viewBox="0 0 300 300"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
        >
            <ellipse
                rx="32.148663"
                ry="33.683538"
                transform="matrix(2.021857 0 0 1.929726 235 64.999999)"
                fill="#f8c171"
                strokeWidth="0"
            />
            <ellipse
                rx="32.148663"
                ry="33.683538"
                transform="matrix(2.021857 0 0 1.929726 235 235.000001)"
                fill="#848484"
                strokeWidth="0"
            />
            <ellipse
                rx="32.148663"
                ry="33.683538"
                transform="matrix(2.021857 0 0 1.929726 64.999999 150)"
                fill="#f87171"
                strokeWidth="0"
            />
        </svg>
    )
}
