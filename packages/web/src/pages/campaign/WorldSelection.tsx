import { animated, useResize, useSpring } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import { useMemo, useRef } from "react"
import {
    WorldInfo,
    WorldInfoUnlocked,
    isWorldUnlocked,
} from "../../../../shared/src/worker-api/world-info"
import { trpc } from "../../common/trpc/trpc"
import { World } from "./World"

export function WorldSelection(props: { onSelected: (world: WorldInfoUnlocked) => void }) {
    const { data: worldnames } = trpc.world.list.useQuery()

    const { data: worlds } = trpc.world.get.useQuery(
        { names: worldnames! },
        { enabled: Boolean(worldnames) },
    )

    if (!worlds) {
        return <SelectInRow worlds={[undefined, undefined, undefined, undefined]} />
    }

    return (
        <div className="flex h-full justify-center">
            <SelectInRow onSelected={props.onSelected} worlds={worlds} />
        </div>
    )
}

function SelectInRow(props: {
    onSelected?: (world: WorldInfoUnlocked) => void
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

    function clampElementIndex(index: number) {
        return Math.max(0, Math.min(pairsOfTwo.length - 1, index))
    }

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
        ({ event, active, movement: [, my], swipe: [, swipeY] }) => {
            event.preventDefault()

            if (swipeY && oldElementIndex.current === newElementIndex.current) {
                const t = newElementIndex.current + (swipeY < 0 ? 1 : -1)
                newElementIndex.current = clampElementIndex(t)
            }

            if (active) {
                newElementIndex.current = clampElementIndex(
                    oldElementIndex.current - Math.round(my / elementHeight.get()),
                )
            } else {
                oldElementIndex.current = newElementIndex.current
            }

            let ty = -oldElementIndex.current * elementHeight.get()

            if (oldElementIndex.current === pairsOfTwo.length - 1) {
                ty += parentHeight.get() - elementHeight.get()
                ty = Math.min(ty, 0)
            }

            api.start({
                y: ty + (active ? my : 0),
                immediate: active,
            })
        },
        {
            filterTaps: true,
        },
    )

    return (
        <div ref={parentRef} className="relative h-full w-full touch-none select-none">
            <div className="absolute inset-0 flex w-full justify-center">
                <animated.div className="h-fit w-[60rem]" {...binds()} style={springs}>
                    <div className="flex flex-col">
                        {pairsOfTwo.map((pair, index) => (
                            <div ref={elementRef} className="" key={index}>
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
        </div>
    )
}

export function WorldPair(props: {
    world0: WorldInfo | undefined
    world1: WorldInfo | undefined
    onSelected?: (world: WorldInfoUnlocked) => void
}) {
    return (
        <div className="xs:flex-row flex flex-col justify-center gap-4 p-2">
            <World
                world={props.world0}
                onSelected={() => isWorldUnlocked(props.world0) && props.onSelected?.(props.world0)}
            />
            <World
                world={props.world1}
                onSelected={() => isWorldUnlocked(props.world1) && props.onSelected?.(props.world1)}
            />
        </div>
    )
}
