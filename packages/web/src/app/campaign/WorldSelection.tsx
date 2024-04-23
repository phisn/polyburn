import { useEffect, useState } from "react"
import { WorldView } from "shared/src/views/world-view"
import { trpcNative } from "../../common/trpc/trpc-native"
import { World } from "./World"

export function WorldSelection(props: { onSelected: (world: WorldView) => void }) {
    const chapterBackgroundColors = [
        "bg-red-500", // Light Blue
        "bg-green-500", // Green
        "bg-yellow-500", // Yellow
        "bg-orange-500", // Orange
        "bg-purple-500", // Purple
        "bg-amber-500", // Bronze (using amber as an approximation)
        "bg-slate-500", // Silver (using slate as a closer match in Tailwind)
        "bg-blue-500", // Red
        "bg-yellow-600", // Gold (using a darker shade of yellow)
        "bg-black border-base-100 border-2", // Black
    ]

    const selectedColor = 0

    function ChapterIndicator(props: { selected: boolean; colorClassNames: string }) {
        return (
            <div
                className={
                    "h-8 w-8 overflow-hidden rounded-lg duration-200 " +
                    (props.selected
                        ? " scale-[1.5] "
                        : " hover:scale-125 hover:cursor-pointer active:scale-110 ") +
                    props.colorClassNames
                }
            >
                <div
                    className={
                        "flex h-full w-full items-center justify-center transition hover:bg-opacity-50 " +
                        (props.selected ? "" : "hover:bg-white")
                    }
                >
                    {props.selected && <div className="h-3 w-3 rounded bg-white bg-opacity-60" />}
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col justify-center p-8">
            <div className="max-h-full w-full p-4">
                <WorldSelectionList {...props} />
            </div>
            <div className="flex w-full justify-center space-x-8">
                {chapterBackgroundColors.map((x, i) => (
                    <ChapterIndicator key={i} selected={i === selectedColor} colorClassNames={x} />
                ))}
            </div>
        </div>
    )

    /*
     */

    /*
    return (
        <div className="h-full">
            <div
                className={`flex h-full w-full flex-auto flex-col space-y-8 py-4 lg:justify-start`}
            >
                <div className="flex w-full justify-center space-x-8">
                    {chapterBackgroundColors.map((x, i) => (
                        <ChapterIndicator
                            key={i}
                            selected={i === selectedColor}
                            colorClassNames={x}
                        />
                    ))}
                </div>
                <div className="xs:grid-cols-2 relative grid h-min flex-1 grid-cols-1 flex-wrap gap-4 p-1">
                    <WorldSelectionList {...props} />
                </div>
                <div className="flex w-full justify-center">
                    <button className="btn btn-lg btn-outline">
                        <BackArrowSvg width="32" height="32" />
                        Back to Main Menu
                    </button>
                </div>
            </div>
        </div>
    )
    */
}

export function WorldSelectionList(props: { onSelected: (world: WorldView) => void }) {
    const [worlds, setWorlds] = useState<(WorldView | undefined)[]>([
        undefined,
        undefined,
        undefined,
        undefined,
    ])

    useEffect(() => {
        const f = async () => {
            const waitMinimum = new Promise(resolve => setTimeout(resolve, 500))

            const worldnames = await trpcNative.world.list.query()

            const worlds = await trpcNative.world.get.query({
                names: worldnames,
            })

            await waitMinimum

            setWorlds(worlds)
        }

        f()
    }, [])

    return (
        <div className="flex max-h-full max-w-full space-x-2">
            <div className="flex max-h-full w-full flex-col items-end justify-center space-y-2">
                <World world={worlds[0]} onSelected={() => {}} />
                <World world={worlds[2]} onSelected={() => {}} />
            </div>
            <div className="flex max-h-full w-full flex-col items-start justify-center space-y-2">
                <World world={worlds[1]} onSelected={() => {}} />
                <World world={worlds[3]} onSelected={() => {}} />
            </div>
        </div>
    )
}
