import { EntityType } from "game/proto/world"
import { RocketSvg } from "../../../../components/common/svg/Rocket"
import { useEditorStore } from "../../store/store"

export function Hierarchy() {
    const world = useEditorStore(x => x.world)
    const select = useEditorStore(x => x.select)
    const selected = useEditorStore(x => x.selected)
    const deselect = useEditorStore(x => x.deselect)

    const entities = [...world.entities.values()]

    return (
        <div className="flex h-full flex-col p-1">
            <div className="border-base-200 h-full w-full rounded-xl border-2 pt-4">
                {entities.map(entity => {
                    const isSelected = selected.includes(entity.id)

                    const { bgDefault, bgHover } = isSelected
                        ? {
                              bgDefault: "bg-base-200",
                              bgHover: "bg-base-100",
                          }
                        : {
                              bgDefault: "bg-base-300",
                              bgHover: "bg-base-200",
                          }

                    function onClick() {
                        if (isSelected) {
                            deselect(entity.id)
                        } else {
                            select(entity.id)
                        }
                    }

                    return (
                        <div
                            className={`hover:${bgHover} ${bgDefault} flex items-center space-x-2 p-1 px-5 transition hover:cursor-pointer`}
                            onClick={onClick}
                        >
                            <div className="text-base-100 text-sm">{entity.id}</div>
                            <RocketSvg width="16" height="16" />
                            <div>{EntityType[entity.type]}</div>
                        </div>
                    )
                })}
                <div className="divider divider-vertical" />
                <Properties />
            </div>
        </div>
    )
}

function Properties() {
    const world = useEditorStore(x => x.world)
    const selected = useEditorStore(x => x.selected)

    const select = useEditorStore(x => x.select)
    const deselect = useEditorStore(x => x.deselect)

    const entities = [...world.entities.values()].filter(x => selected.includes(x.id))

    return <></>
}
