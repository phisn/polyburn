import { animated, useResize, useSpring } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import { useMemo, useRef } from "react"

export function DraggableList(props: {
    length: number
    className?: string
    children: (index: number) => React.ReactNode
    onSwipeHorizontal?: (side: "left" | "right") => void
}) {
    const firstChildRef = useRef<HTMLDivElement>(null)
    const relativeContainerRef = useRef<HTMLDivElement>(null)
    const absoluteContainerRef = useRef<HTMLDivElement>(null)

    const oldElementIndex = useRef(0)
    const newElementIndex = useRef(0)

    const elements = useMemo(() => Array.from({ length: props.length }), [props.length])

    const { height: elementHeight } = useResize({
        container: firstChildRef,
    })

    const { height: relativeContainerHeight } = useResize({
        container: relativeContainerRef,
    })

    const { height: absoluteContainerHeight } = useResize({
        container: absoluteContainerRef,
    })

    function clampElementIndex(index: number) {
        const allowed = Math.floor(
            (absoluteContainerHeight.get() - relativeContainerHeight.get()) / elementHeight.get(),
        )

        return Math.max(0, Math.min(allowed + 1, index))
    }

    const [springs, api] = useSpring(() => ({
        y: 0,
        config: {
            tension: 210,
            friction: 20,
        },
    }))

    function applyScrollCap(moveDownBy: number, smoothed?: number) {
        if (moveDownBy > 0) {
            return Math.pow(moveDownBy, smoothed ?? 1)
        }

        const largerChild = relativeContainerHeight.get() - absoluteContainerHeight.get()

        if (largerChild > 0) {
            return Math.sign(moveDownBy) * Math.pow(Math.abs(moveDownBy), smoothed ?? 1)
        }

        const overscrollDown = largerChild - moveDownBy

        if (overscrollDown > 0) {
            moveDownBy += overscrollDown

            if (smoothed) {
                moveDownBy -= Math.pow(overscrollDown, smoothed)
            }
        }

        return moveDownBy
    }

    function handleGesture(props: { active: boolean; my: number; swipeY: number; vy: number }) {
        // allow swiping
        if (props.swipeY && oldElementIndex.current === newElementIndex.current) {
            const t = newElementIndex.current + (props.swipeY < 0 ? 1 : -1)
            newElementIndex.current = clampElementIndex(t)
        }

        if (props.active === false) {
            oldElementIndex.current = newElementIndex.current
        }

        // calculate movement
        let moveDownBy = -oldElementIndex.current * elementHeight.get()
        moveDownBy = applyScrollCap(moveDownBy)

        // apply change of gesture
        if (props.active) {
            moveDownBy += props.my
            moveDownBy = applyScrollCap(moveDownBy, 0.8)
        }

        // stop at element
        if (props.active) {
            const moveDownTarget = moveDownBy + Math.sign(props.my) * props.vy * 50

            newElementIndex.current = clampElementIndex(
                -Math.round(moveDownTarget / elementHeight.get()),
            )
        }

        api.start({
            y: moveDownBy,
            config: {
                velocity: props.active ? props.vy : 0,
            },
        })
    }

    const binds = useGesture(
        {
            onDrag: ({
                event,
                active,
                intentional,
                movement: [, my],
                swipe: [swipeX, swipeY],
                velocity: [, vy],
            }) => {
                event.preventDefault()
                handleGesture({ active, my, swipeY, vy })

                if (intentional && swipeX && !swipeY) {
                    props.onSwipeHorizontal?.(swipeX > 0 ? "right" : "left")
                }
            },
            onWheel: ({ active, movement: [, my] }) => {
                handleGesture({ active, my, swipeY: 0, vy: 0 })
            },
        },
        {
            drag: {
                filterTaps: true,
            },
            wheel: {},
        },
    )

    return (
        <div ref={relativeContainerRef} className={"relative h-full " + props.className}>
            <animated.div
                ref={absoluteContainerRef}
                className="absolute inset-0 flex h-max touch-none select-none flex-col items-center "
                {...binds()}
                style={springs}
            >
                {elements.map((_, index) => (
                    <div
                        ref={index === 0 ? firstChildRef : undefined}
                        key={index}
                        className="w-full"
                    >
                        {props.children(index)}
                    </div>
                ))}
            </animated.div>
        </div>
    )
}
