import { useMemo } from "react"
import {
    WorldInfo,
    WorldInfoUnlocked,
    isWorldUnlocked,
} from "../../../../shared/src/worker-api/world-info"
import { trpc } from "../../common/trpc/trpc"
import { DraggableList } from "../../components/common/DraggableList"
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

    return (
        <DraggableList length={pairsOfTwo.length} className="h-full w-full">
            {index => (
                <WorldPair
                    world0={pairsOfTwo[index][0]}
                    world1={pairsOfTwo[index][1]}
                    onSelected={world => props.onSelected?.(world)}
                />
            )}
        </DraggableList>
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
