import { animated, useSprings } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import { useMemo } from "react"
import { WorldView } from "shared/src/views/world-view"
import { trpc } from "../../common/trpc/trpc"
import { World } from "./World"

export function WorldSelection(props: { onSelected: (world: WorldView) => void }) {
    const { data, isLoading, isError, error } = trpc.world.list.useQuery()

    if (isLoading) {
        return <SelectInRow worlds={[undefined, undefined, undefined, undefined]} />
    }

    return (
        <div className="flex h-full justify-center">
            <SelectInRow
                onSelected={props.onSelected}
                worlds={[undefined, undefined, undefined, undefined]}
            />
        </div>
    )
}

function SelectInRow(props: {
    onSelected?: (world: WorldView) => void
    worlds: (WorldView | undefined)[]
}) {
    const pairsOfTwo = useMemo(() => {
        const pairs = []
        for (let i = 0; i < props.worlds.length; i += 2) {
            pairs.push([props.worlds[i], props.worlds[i + 1]])
        }
        return pairs
    }, [props.worlds])

    const [props, api] = useSprings(() => ({ y: 0 }))

    const bind = useDrag(
        ({ offset: [, oy], memo = y.get() }) => {
            api.start({ y: memo + oy })
            return memo
        },
        { axis: "y" },
    )

    return (
        <div {...bind()} style={{ height: "100vh", overflow: "hidden" }}>
            <animated.div style={{ y }}>
                {pairsOfTwo.map((pair, index) => (
                    <WorldPair
                        key={index}
                        world0={pair[0]}
                        world1={pair[1]}
                        onSelected={props.onSelected}
                    />
                ))}
            </animated.div>
        </div>
    )
}

export function WorldPair(props: {
    world0: WorldView | undefined
    world1: WorldView | undefined
    onSelected?: (world: WorldView) => void
}) {
    return (
        <div className="xs:flex-row flex w-full flex-col gap-2 p-2">
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
