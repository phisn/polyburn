import { useCallback } from "react"
import { PlaceableObject } from "../../World"
import { placeableObjects, PlaceableObjectSelectable } from "./PlaceableObjects"

interface SinglePlaceableObjectProps {
    obj: PlaceableObjectSelectable
    selected: boolean
    onSelect: (obj: PlaceableObject) => void
}

interface PlaceableObjectSelectProps {
    selected: PlaceableObject | undefined
    onSelect: (obj: PlaceableObject | undefined) => void
}

const SinglePlaceableObject = (props: SinglePlaceableObjectProps) => (
    <button
        onClick={() => props.onSelect(props.obj)} 
        className={`btn h-min ${props.selected ? "btn-active" : ""}`}>
        <div className="flex flex-col p-5 space-y-4 items-center">
            <img src={props.obj.src} className={`${props.obj.className} w-8`} />
            <div>
                { props.obj.type.toString() }
            </div>
        </div>
    </button>
)

function PlacableObjectSelector(props: PlaceableObjectSelectProps) {
    const onSelect = useCallback((obj: PlaceableObject) => {
        if (props.selected?.src === obj.src) {
            props.onSelect(undefined)
        }
        else {
            props.onSelect(obj)
        }

    }, [ props.onSelect, props.selected ])

    return (
        <div className="btn-group btn-group-vertical">
            { placeableObjects.map(obj => (
                <SinglePlaceableObject
                    key={obj.type}
                    obj={obj}
                    selected={props.selected?.src === obj.src}
                    onSelect={onSelect}
                />
            )) }
        </div>
    )
}

export default PlacableObjectSelector
