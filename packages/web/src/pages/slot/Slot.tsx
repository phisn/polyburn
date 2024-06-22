import { Transition } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import { BackArrowSvg } from "../../components/common/svg/BackArrow"

function SlotItem(props: { item: string; blur?: boolean }) {
    const color = {
        A: "bg-gray-600",
        B: "bg-gray-400",
        C: "bg-[#82A67D]",
        D: "bg-blue-400",
        Z: "bg-red-500",
    }

    return (
        <div
            className={`border-base-200 flex h-full w-40 flex-shrink-0 items-center justify-center border-x ${color[props.item as keyof typeof color]}`}
        >
            <div className={`${props.blur && "blur-sm"}`}>{props.item}</div>
        </div>
    )
}

function SlotRunner(props: { target: string; running: boolean }) {
    const line = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [found, setFound] = useState(false)

    function randoms(len: number) {
        const values = {
            A: 1000,
            B: 700,
            C: 250,
            D: 100,
            Z: 1,
        }

        const total = Object.values(values).reduce((acc, val) => acc + val, 0)
        const result = []

        for (let i = 0; i < len; i++) {
            const random = Math.random() * (total + 1)
            let sum = 0

            for (const [item, value] of Object.entries(values)) {
                sum += value

                if (random < sum) {
                    result.push(item)
                    break
                }
            }
        }

        return result
    }

    const items = randoms(80)

    const toSkip = items.length

    items.push(...randoms(1))
    items.push(props.target)
    items.push(props.target)
    items.push(...randoms(10))

    useEffect(() => {
        if (props.running) {
            const timeToStop = 5000
            const distanceToStop = 10 * (toSkip - 4) // rem

            type PointFunction = (t: number) => number

            function bezier(t: number, p: PointFunction[]): number {
                const n = p.length
                const tempPoints = p.map(func => func(t)) // Evaluate all control point functions at t

                for (let r = 1; r < n; r++) {
                    for (let i = 0; i < n - r; i++) {
                        tempPoints[i] = (1 - t) * tempPoints[i] + t * tempPoints[i + 1]
                    }
                }

                return tempPoints[0] // The final point is the Bezier curve point at parameter t
            }

            function timeToDistance(t: number) {
                return bezier(Math.min(1, t), [
                    _ => 0,
                    t => Math.pow(t, 5),
                    t => Math.pow(t, 0.4),
                    t => Math.pow(t, 0.3),
                    t => Math.pow(t, 0.3),
                    t => Math.pow(t, 0.2),
                    t => Math.pow(t, 0.2),
                    t => Math.pow(t, 0.1),
                    t => Math.pow(t, 0.1),
                    t => Math.pow(t, 0.1),
                    _ => 1,
                ]) // Linear Bezier curve
            }

            let start = 0
            let previousDistance = -6

            new Audio("/click.wav")

            // use requestAnimationFrame to animate
            function animate(timeStamp: number) {
                if (!line.current) {
                    return
                }

                if (start === 0) {
                    start = timeStamp
                }

                const time = timeStamp - start

                // console.log(timeToDistance(time / timeToStop))

                const distance = timeToDistance(time / timeToStop) * distanceToStop

                if (Math.floor((distance + 5.5) / 10) > Math.floor((previousDistance + 5.5) / 10)) {
                    new Audio("/click.wav").play()
                    previousDistance = distance
                }

                console.log(distance)

                // set x position of line.current
                line.current.style.left = `${-distance - 45}rem`
                //console.log(distance)

                if (distance < distanceToStop) {
                    requestAnimationFrame(animate)
                } else {
                    boxRef.current!.style.width = "10rem"
                }
            }

            setTimeout(() => {
                requestAnimationFrame(animate)
            }, 300)
        }
    }, [props.running, toSkip])

    // should start with zero width and get to normal width in one second
    return (
        <Transition
            ref={boxRef}
            show={props.running}
            enter="transition-[width] duration-[1s] ease-in-out"
            enterFrom="w-0"
            enterTo="transition-[width] duration-[1s] w-[70rem] ease-in-out"
        >
            <div className="relative flex h-40 items-center justify-center overflow-x-hidden rounded-xl border">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 transform">
                    <div className="absolute inset-0 flex" ref={line} style={{ left: "-45rem" }}>
                        {items.map((item, index) => (
                            <SlotItem key={index} item={item} blur={!props.running} />
                        ))}
                    </div>
                </div>
            </div>
        </Transition>
    )
}

export function Slot() {
    const [running, setRunning] = useState(false)

    function onRoll() {
        setRunning(true)
    }

    return (
        <>
            <div className="flex w-full justify-center">
                <div className="relative flex items-center space-x-8">
                    {!running && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="btn btn-lg btn-ghost w-32" onClick={onRoll}>
                                Roll
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col items-center">
                        <SlotRunner running={running} target="Z" />

                        {running && (
                            <div className="absolute -bottom-16">
                                <BackArrowSvg width="64" height="64" className="rotate-90" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
