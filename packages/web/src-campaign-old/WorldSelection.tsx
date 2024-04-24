import { Suspense } from "react"
import { WorldView } from "shared/src/views/world-view"
import { useAppStore } from "../src/common/storage/app-store"
import { trpc } from "../src/common/trpc/trpc"
import { World } from "./World"

export function WorldSelection(props: { onSelected: (world: WorldView) => void }) {
    return (
        <div className="relative h-full">
            <div className={`flex h-full w-full justify-center pt-4`}>
                <div className="xs:grid-cols-2 grid h-min grid-cols-1 flex-wrap gap-4 p-1">
                    <Suspense fallback={<WorldSelectionFallback />}>
                        <WorldSelectionList {...props} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export function WorldSelectionList(props: { onSelected: (world: WorldView) => void }) {
    const userId = useAppStore(store => store.userId())

    const [worldNames] = trpc.world.list.useSuspenseQuery()

    const [worlds] = trpc.world.get.useSuspenseQuery({
        names: worldNames,
        userId,
    })

    return (
        <>
            {worlds.map(world => (
                <World
                    key={world.id.name}
                    world={world}
                    onSelected={() => props.onSelected(world)}
                />
            ))}
        </>
    )
}

export function WorldSelectionFallback() {
    return <div>Loading...</div>
}
