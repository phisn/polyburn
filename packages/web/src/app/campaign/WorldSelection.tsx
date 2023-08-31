import { World, WorldInfo } from "./World"

export function WorldSelection(props: {
    worlds: WorldInfo[]
    onSelected: (world: WorldInfo) => void
}) {
    return (
        <div className="relative h-full">
            <div className={`flex h-full w-full justify-center pt-4`}>
                <div className="xs:grid-cols-2 grid h-min grid-cols-1 flex-wrap gap-4 p-1">
                    {props.worlds.map(world => (
                        <World info={world} onClick={() => props.onSelected(world)} />
                    ))}
                </div>
            </div>
        </div>
    )
}
