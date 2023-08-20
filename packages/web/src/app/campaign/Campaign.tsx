import { Transition } from "@headlessui/react"
import { Fragment, useState, useTransition } from "react"
import { WorldModel } from "runtime/proto/world"
import Navbar from "../../common/components/Navbar"
import { BackArrowSvg } from "../../common/components/inline-svg/BackArrow"
import { StopSvg } from "../../common/components/inline-svg/Stop"
import Game from "../../game/Game"
import { Gamemode, GamemodeStats } from "./Gamemode"
import { World, WorldInfo } from "./World"

export default function Campaign() {
    const modes: GamemodeStats[] = [
        {
            name: "Normal",
            rank: { rank: "Diamond", time: "01:03.023", position: 41 },
        },
        {
            name: "Hard",
            rank: { rank: "Gold", time: "06:23.442", position: 355 },
        },
        { name: "Reverse" },
        { name: "Low gravity", locked: true },
        { name: "Third Gamemode", locked: true },
    ]
    ;("flex-col")

    const worlds: WorldInfo[] = [
        {
            raw: "CtcSCgZub3JtYWwSzBIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABAGpMKCpAKH4UAws3MNEFJUtwAH4UAwmZmEkJJUtwAAADAwaRwDEJJUtwAZmYywaRwDEJJUtwAPQrPwNejFUJJUtwAcT2KwM3MQkJJUtwAZmaGv9ejPkJJUtwAzcysv6RwDEJJUtwArkehQAAAG0JJUtwAMzNjQK5HREJJUtwAMzPTQOF6OkJJUtwArkfhQMP1RkJJUtwACtdDQTMzOkJJUtwA16MoQT0KCkJJUtwAzcxoQbgeEEJJUtwAZmbWQbgeEEJJUtwAPQrxQcP1CUJJUtwAj8LfQVyP8kFJUtwA9ii0Qc3M7EFJUtwAw/XKQXE9skFJUtwAhesAQo/Cj0FJUtwASOHqQT0Kv0FJUtwA7FEqQrgevUFJUtwAZmY3QlyPGUJJUtwApHBbQpqZCEJJUtwAheuUQvYoG0JJUtwArseaQtej+kFJUtwAHwWKQnsUAUJJUtwAKVxPQkjh3EFJUtwAKVw9QjMzi0FJUtwAH4ViQjMzi0FJUtwAzcxZQs3MpEBJUtwAzcxiQlK4Hj9JUtwA4XpuQgrXIz1JUtwAcT11Qo/CNb9JUtwAXI93QjMzM8BJUtwA16NfQhSua8FJUtwAmpl/Qq5HRcFJUtwA9iiIQlyPgMFJUtwAM7OfQgAAgMFJUtwAuJ6lQgrXD8FJUtwASOGtQsP10MBJUtwAj8K0QilcK8FJUtwAKVy7Qq5HgcBJUtwAheu+QgrXq8BJUtwAPQrDQnsUpsBJUtwAPYq9Qh+F88BJUtwAHwW/Qh+FR8FJUtwAzczMQh+FR8FJUtwAzczPQhSu/8BJUtwAUrjKQgAAsMBJUtwA9ijRQj0KR8BJUtwA16PXQrgencBJUtwAUrjbQgAAoMBJUtwAuB7cQtejAMBJUtwAw/XdQvYo3D5JUtwAj8LaQq5HIUBJUtwApHDWQo/CjUBJUtwAAADWQuxRBEFJUtwA7NHXQoXrIUFJUtwApHDYQoXr8UBJUtwAAIDdQtejHEFJUtwACtfUQh+FT0FJUtwAuB7VQnE9akFJUtwAZmbeQilcg0FJUtwAw3XaQlyPlEFJUtwAmhnYQqRwpUFJUtwAFC7gQq5HoUFJUtwAM7PrQilcoUFJUtwAw/XxQqRwp0FJUtwAj8L/QuxRskFJUtwAClcCQ1K45EFJUtwA12MAQ0jhFEJJUtwA7FHsQpqZFUJJUtwAcb3hQj0KEUJJUtwAw3XcQgAAHEJJUtwAPQrTQuxRHkJJUtwArkfLQmZmH0JJUtwAKVzKQnsUMEJJUtwAcT3VQnE9LkJJUtwA16PkQtejJ0JJUtwAHwXxQoXrLEJJUtwAexTsQilcPkJJUtwAFK73QilcQ0JJUtwAw3UDQylcQ0JJUtwAhesIQ8P1PUJJUtwA16MFQ3sUMEJJUtwAUngFQ1K4A0JJUtwAUrgKQwrX10FJUtwAuJ4TQ65HxUFJUtwAM3MfQzMzyUFJUtwAhSsmQz0K+UFJUtwAcT0pQ0jhBkJJUtwAPYoqQ3E9I0JJUtwArgcoQ9ejOUJJUtwAPcorQzMzN0JJUtwAXE80QzMzN0JJUtwAXA82Q83M+EFJUtwAzcwoQxSuCMJJUtwArkfoQuxRDMJJUtwAH4UtQgrXDsJJUtwArkcZQoXrccFJUtwAXI/WQR+F48BJUtwAUrhmQRSu30BJUtwAMzOTv83MNEFJUtwAw/X0wc3MNEFJUtwACtf9wc3MNEFJUtwAH4UAws3MNEFJUtwAGvcFCvQFzcyTQo/CZUBJUtwApPCMQsP1WEBJUtwAZmaHQhSuz0BJUtwAhet2Qs3MrEBJUtwA9ih1Qtej+EBJUtwA16NqQlK4EkFJUtwApHCGQlyPQkFJUtwAexSCQvYojEFJUtwAFC6PQnE9ukFJUtwAj0KYQhSum0FJUtwA4fqiQgAAtkFJUtwAKVyoQqRwqUFJUtwA4XqrQgAAwkFJUtwArseoQgrX40FJUtwA1yOsQnsUZ0JJUtwAmhnIQnsUgkJJUtwAj8IqQylchEJJUtwAXI8jQ0jhXUJJUtwAzQwhQ9ejOEJJUtwA1yMkQ65HEEJJUtwArkcfQ5qZH0JJUtwAjwIaQ4XrKEJJUtwAXA8VQ65HH0JJUtwArgcSQ/YoBkJJUtwArgcOQ1K4+EFJUtwAj8IPQ9ejF0JJUtwAuB4NQ3E9I0JJUtwApHAUQ3sUQEJJUtwAZqYMQ1K4S0JJUtwAUrgHQ6RwcUJJUtwA7NHnQs3MbEJJUtwAPYrhQlK4WkJJUtwAe5TlQo/CP0JJUtwAcb3fQqRwPkJJUtwArsfWQtejUkJJUtwAcb3HQo/CSEJJUtwAPYq+QrgeK0JJUtwASGHEQlyPCEJJUtwAw3XTQqRwC0JJUtwAzUzcQvYoAEJJUtwAuJ7cQmZm6kFJUtwAFK7QQqRw20FJUtwA9qjUQgAAwkFJUtwAUrjQQq5HqUFJUtwA16PNQrgeUUFJUtwA7FHPQjMzP0FJUtwAMzPPQlK4BkFJUtwAKdzLQkjh0kBJUtwA1yPRQnsUjkBJUtwAcT3NQh+Fe0BJUtwAPYrFQnsUnkBJUtwA7FHBQq5HgT9JUtwAHwWxQlK4TkBJUtwAuJ6wQs3MzL9JUtwAe5SrQq5H4T1JUtwAClelQnsUrkBJUtwAe5SXQgrXc0BJUtwASGGXQuF6tL9JUtwAM7OaQuF6xMBJUtwAcT2SQh+F08BJUtwAcb2TQo/CRUBJUtwArseTQqRwXUBJUtwAzcyTQo/CZUBJUtwAEhIKBm5vcm1hbBIICgZub3JtYWw=",
            name: "Map 1",
            maxProgress: 3,
            progress: { modes: 2 },
        },
        { raw: "", name: "Map 2", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
    ]

    const [worldSelected, setWorldSelected] = useState<WorldInfo>()
    const [gamemodeSelected, setGamemodeSelected] = useState<string>()

    function onWorldSelected(name: WorldInfo | undefined) {
        setWorldSelected(name)
        setGamemodeSelected(undefined)

        window.scrollTo(0, 0)
    }

    function onGamemodeSelected(gamemode: GamemodeStats) {
        startTransition(() => {
            setGamemodeSelected(gamemode.name)
        })
    }

    const [isPending, startTransition] = useTransition()

    if (worldSelected && gamemodeSelected) {
        const map = WorldModel.decode(
            Uint8Array.from(atob(worldSelected.raw), c => c.charCodeAt(0)),
        )

        return (
            <div className="absolute bottom-0 left-0 right-0 top-0 ">
                <Game world={map} gamemode="normal" />

                <div
                    className="absolute left-0 top-0 p-4"
                    style={{
                        touchAction: "none",
                        userSelect: "none",

                        // Prevent canvas selection on ios
                        // https://github.com/playcanvas/editor/issues/160
                        WebkitTouchCallout: "none",
                        WebkitUserSelect: "none",
                        WebkitTapHighlightColor: "rgba(255,255,255,0)",
                    }}
                >
                    <Navbar>
                        <button
                            className="btn btn-square btn-ghost"
                            onClick={() => {
                                setGamemodeSelected(undefined)
                                setWorldSelected(undefined)
                            }}
                        >
                            <StopSvg width="16" height="16" />
                        </button>
                    </Navbar>
                </div>
            </div>
        )
    }

    console.log("pending", isPending)

    return (
        <>
            <div className="relative h-full">
                <div
                    className={`flex h-full w-full justify-center pt-4 ${
                        worldSelected && "absolute top-0 overflow-hidden"
                    }`}
                >
                    <div className="grid h-min w-full gap-8 p-4 sm:grid-cols-2">
                        {worlds.map((world, i) => (
                            <div
                                key={i}
                                className={`justify-self-center ${
                                    i % 2 === 0 ? "sm:justify-self-end" : "sm:justify-self-start"
                                }`}
                            >
                                <World {...world} onClick={() => onWorldSelected(world)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Transition
                show={worldSelected !== undefined}
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="absolute left-0 top-0 min-h-screen w-full overflow-visible overscroll-contain bg-white bg-opacity-10 py-4 backdrop-blur-md"
                    onClick={() => {
                        onWorldSelected(undefined)
                    }}
                >
                    <Transition
                        show={!isPending && worldSelected !== undefined}
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        appear
                    >
                        <div className="flex justify-center">
                            <div className="grid w-full gap-6 p-4">
                                <div className="btn grid w-full max-w-[28rem] grid-cols-3 justify-self-center bg-opacity-50">
                                    <div className="justify-self-center">
                                        <BackArrowSvg height="40" width="40" />
                                    </div>
                                    <div className="text-xl text-white">{worldSelected?.name}</div>
                                </div>
                                {modes.map((gamemode, i) => (
                                    <Gamemode
                                        key={i}
                                        onClick={() => onGamemodeSelected(gamemode)}
                                        {...gamemode}
                                    />
                                ))}
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </>
    )
}
