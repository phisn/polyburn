import { useEffect, useMemo, useState } from "react"
import { WorldDTO } from "shared/src/server/world"
import { worldService } from "../../common/services/world-service"
import { DraggableList } from "../../components/common/DraggableList"
import { World } from "./World"

export function WorldSelection(props: { onSelected: (world: WorldDTO) => void }) {
    const [worlds, setWorlds] = useState<WorldDTO[]>()

    useEffect(() => {
        worldService.list().then(worlds => {
            setWorlds(worlds)
        })
    }, [])

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
    onSelected?: (world: WorldDTO) => void
    worlds: (WorldDTO | undefined)[]
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
    world0: WorldDTO | undefined
    world1: WorldDTO | undefined
    onSelected?: (world: WorldDTO) => void
}) {
    return (
        <div className="xs:flex-row flex flex-col justify-center gap-4 p-2">
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
