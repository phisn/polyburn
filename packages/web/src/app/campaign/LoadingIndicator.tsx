import { useEffect, useRef, useState } from "react"

import "./LoadingIndicator.tsx.css"

export default function LoadingIndicator(props: { loading: boolean; onAnimationEnd: () => void }) {
    const spinnerRef = useRef<HTMLDivElement>(null)
    const propsRef = useRef(props)

    const [internalLoading, setInternalLoading] = useState(true)

    console.log("loading: ", props.loading)

    // set animation
    useEffect(() => {
        console.log("useEffect")
        const animations = [
            "growToLeft 0.75s forwards",
            "shrinkToLeft 0.75s forwards",
            "growToRight 0.75s forwards",
            "shrinkToBottom 0.75s forwards",
            "growToTop 0.75s forwards",
            "shrinkToTop 0.75s forwards",
            "growToBottom 0.75s forwards",
            "shrinkToRight 0.75s forwards",
        ]

        let animationCount = 0

        const onInterval = () => {
            if (spinnerRef.current) {
                if (propsRef.current.loading === false && animationCount % 2 === 0) {
                    setTimeout(() => {
                        clearInterval(interval)
                        setInternalLoading(false)

                        propsRef.current.onAnimationEnd()
                    }, 200)
                } else {
                    spinnerRef.current.style.width = ""
                }

                if (propsRef.current.loading || animationCount % 2 === 1) {
                    spinnerRef.current.style.animation = animations[animationCount]
                    animationCount = (animationCount + 1) % animations.length
                }
            }
        }

        let interval: NodeJS.Timeout

        setTimeout(() => {
            onInterval()
            interval = setInterval(onInterval, 750)
        }, 0)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        propsRef.current = props
    })

    return (
        internalLoading && (
            <div className="h-32 w-32">
                <div style={{ width: "0px" }} className="relative h-32 bg-white" ref={spinnerRef} />
            </div>
        )
    )
}
