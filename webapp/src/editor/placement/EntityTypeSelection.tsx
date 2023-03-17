import { useCallback } from "react"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"

interface EntityTypeDisplayProps {
    type: EntityType
    selected: boolean
    onSelect: (type: EntityType) => void
}

const EntityTypeButton = (props: EntityTypeDisplayProps) => {
    const entity = entities[props.type]

    const entityClassname = ({
        [EntityType.Rocket]:    "h-12",
        [EntityType.GreenFlag]: "pl-2",
        [EntityType.RedFlag]:   "pl-2",
    })[props.type]

    return (
        <button
            onClick={() => props.onSelect(props.type)} 
            className={`btn h-min ${props.selected ? "btn-active" : ""}`}>
            <div className="flex flex-col p-5 space-y-4 items-center">
                <img src={entity.src} className={`${entityClassname} w-8`} />
                <div>
                    { props.type.toString() }
                </div>
            </div>
        </button>
    )
}

interface EntityTypeSelectionProps {
    selected: EntityType | undefined
    onSelect: (type: EntityType | undefined) => void
}

function EntityTypeSelection(props: EntityTypeSelectionProps) {
    const onSelect = useCallback((type: EntityType) => {
        if (props.selected === type) {
            props.onSelect(undefined)
        }
        else {
            props.onSelect(type)
        }

    }, [ props ])

    return (
        <div className="btn-group btn-group-vertical">
            {
                Object.keys(entities)
                    .map(type => type as EntityType)
                    .map(type => (
                        <EntityTypeButton
                            key={type}
                            type={type}
                            selected={props.selected === type}
                            onSelect={onSelect}
                        />
                    ))
            }
        </div>
    )
}

export default EntityTypeSelection
