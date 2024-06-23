import { animated, useResize, useSpring } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import { useMemo, useRef } from "react"
import { WorldInfo } from "../../../../shared/src/worker-api/world-info"
import { trpc } from "../../common/trpc/trpc"
import { World } from "./World"

export function WorldSelection(props: { onSelected: (world: WorldInfo) => void }) {
    const { data, isLoading, isError, error } = trpc.world.list.useQuery()

    if (isLoading) {
        return <SelectInRow worlds={[undefined, undefined, undefined, undefined]} />
    }

    return (
        <div className="flex flex-grow justify-center">
            <SelectInRow
                onSelected={props.onSelected}
                worlds={[undefined, undefined, undefined, undefined]}
            />
        </div>
    )
}

function SelectInRow(props: {
    onSelected?: (world: WorldInfo) => void
    worlds: (WorldInfo | undefined)[]
}) {
    const pairsOfTwo = useMemo(() => {
        const pairs = []
        for (let i = 0; i < props.worlds.length; i += 2) {
            pairs.push([props.worlds[i], props.worlds[i + 1]])
        }
        return pairs
    }, [props.worlds])

    const elementRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)

    const oldElementIndex = useRef(0)
    const newElementIndex = useRef(0)

    const { height: elementHeight } = useResize({
        container: elementRef,
    })

    const { height: parentHeight } = useResize({
        container: parentRef,
    })

    const [springs, api] = useSpring(() => ({
        y: 0,
    }))

    const binds = useDrag(
        ({ event, active, movement: [mx, my], swipe: [, swipeY], cancel }) => {
            event.preventDefault()

            if (active) {
                newElementIndex.current =
                    oldElementIndex.current - Math.round(my / elementHeight.get())

                newElementIndex.current = Math.max(
                    0,
                    Math.min(pairsOfTwo.length - 1, newElementIndex.current),
                )

                console.log(newElementIndex.current)
            } else {
                oldElementIndex.current = newElementIndex.current
            }

            let ty = -oldElementIndex.current * elementHeight.get()

            if (oldElementIndex.current === pairsOfTwo.length - 1) {
                ty += parentHeight.get() - elementHeight.get()
                ty = Math.min(ty, 0)
            }

            if (active) {
                api.start({
                    y: my + ty,
                })
            } else {
                api.start({
                    y: ty,
                })
            }
        },
        {
            filterTaps: true,
        },
    )

    return (
        <div ref={parentRef} className="relative h-full w-full touch-none select-none">
            <animated.div className="absolute inset-0 flex h-fit" {...binds()} style={springs}>
                <div className="h-fit w-full space-y-0">
                    {pairsOfTwo.map((pair, index) => (
                        <div ref={elementRef} key={index}>
                            <WorldPair
                                world0={pair[0]}
                                world1={pair[1]}
                                onSelected={world => props.onSelected?.(world)}
                            />
                        </div>
                    ))}
                </div>
            </animated.div>
        </div>
    )
}

export function WorldPair(props: {
    world0: WorldInfo | undefined
    world1: WorldInfo | undefined
    onSelected?: (world: WorldInfo) => void
}) {
    return (
        <div className="xs:flex-row flex w-full flex-col justify-center gap-4 p-2">
            <World
                world={props.world0}
                onSelected={() => props.world0 && props.onSelected?.(props.world0)}
            />
            <World
                world={props.world1}
                onSelected={() => props.world1 && props.onSelected?.(props.world1)}
            />
        </div>
    )
}
