import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { WorldView } from "shared/src/views/world-view"
import { IndependentContainer } from "../../common/components/IndependentContainer"
import { trpcNative } from "../../common/trpc/trpc-native"
import { World } from "./World"

export function WorldSelection() {
    const chapterBackgroundColors = [
        "bg-red-500", // Light Blue
        "bg-green-500", // Green
        "bg-yellow-500", // Yellow
        "bg-purple-500", // Purple
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
                    "h-6 w-6 select-none overflow-hidden rounded-lg duration-200 md:h-8 md:w-8 " +
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
                ></div>
            </div>
        )
    }

    return (
        <div className="hxs:space-y-4 flex h-full max-h-[40rem] w-full flex-col space-y-0 px-1 py-2">
            <IndependentContainer className="max-h-[32rem] grow">
                <WorldSelectionList />
            </IndependentContainer>
            {/*
            <div className="hxs:pb-6 flex w-full justify-center space-x-8 p-2 pb-3">
                {chapterBackgroundColors.map((x, i) => (
                    <ChapterIndicator key={i} selected={i === selectedColor} colorClassNames={x} />
                ))}
            </div>
            */}
        </div>
    )
}

export function WorldSelectionList() {
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

    const navigate = useNavigate()

    function WorldWithNavigate(props: { world?: WorldView; locked?: boolean }) {
        return (
            <World
                locked={props.locked}
                world={props.world}
                onSelected={() => {
                    navigate(`/play/${props.world?.id.name}/Normal`)
                }}
            />
        )
    }

    return (
        <div className="flex max-h-full max-w-full space-x-2">
            <div className="flex max-h-full w-full flex-col items-end justify-center space-y-2">
                <WorldWithNavigate world={worlds[0]} />
                <WorldWithNavigate world={worlds[2]} locked={worlds[2] !== undefined} />
            </div>
            <div className="flex max-h-full w-full flex-col items-start justify-center space-y-2">
                <WorldWithNavigate world={worlds[1]} />
                <WorldWithNavigate world={worlds[3]} locked={worlds[3] !== undefined} />
            </div>
        </div>
    )
}
