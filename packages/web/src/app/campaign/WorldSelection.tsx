import { World, WorldInfo } from "./World"

export function WorldSelection(props: {
    worlds: WorldInfo[]
    onSelected: (world: WorldInfo) => void
}) {
    return (
        <div className="relative h-full">
            <div className={`flex h-full w-full justify-center pt-4`}>
                <div className="grid h-min w-full gap-8 p-4 sm:grid-cols-2">
                    {props.worlds.map((world, i) => (
                        <div
                            key={i}
                            className={`justify-self-center ${
                                i % 2 === 0 ? "sm:justify-self-end" : "sm:justify-self-start"
                            }`}
                        >
                            <World {...world} onClick={() => props.onSelected(world)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
