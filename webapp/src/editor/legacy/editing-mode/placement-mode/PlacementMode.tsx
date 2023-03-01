export {}
/*
import { AppProvider, useApp } from "@inlet/react-pixi"
import { useCallback, useEffect, useState } from "react"
import useEditorStore from "../../EditorStore"
import { findClosestEdge, findClosestVertex, isPointInsideObject, PlaceableObject as PlaceableObject, ObjectInWorld, Shape, Vertex, VertexIdentifier, PlaceableObjectType } from "../../World"
import PIXI from "pixi.js"

import { shallow } from "zustand/shallow"
import { useShortcut } from "../../../utility/useShortcut"
import { PlacementHandlerType, PlacementHandlerProps } from "./handler/PlacementHandlerProps"
import PlacementModeHandler from "./handler/PlacementHandler"
import PlacementHandler from "./handler/PlacementHandler"
import PlacableObjectSelector from "./PlacableObjectSelector"

export interface EditorMode {
    editorMenu: () => JSX.Element
    onClick: (x: number, y: number, ctrl: boolean, shift: boolean) => void
}

function PlacementMode(props: { app: PIXI.Application }) {
    const { app } = props

    const state = useEditorStore(state => ({
        undo: state.undo,
        redo: state.redo,
    }), shallow)

    useShortcut("z", state.undo)
    useShortcut("y", state.redo)

    const [placementHandler, setPlacementHandler] = useState<PlacementHandlerProps>()

    useEffect(() => {
        console.log("placementHandler", placementHandler)
    }, [ placementHandler ])

    useEffect(() => {
        if (!placementHandler) {
            setPlacementHandler({
                type: PlacementHandlerType.Default,
                app,
                setHandler: setPlacementHandler,
            })
        }
    }, [ placementHandler ])

    const onSelectObject = (obj: PlaceableObject | undefined) => {
        if (obj) {
            setPlacementHandler({
                type: PlacementHandlerType.PlaceObject,
                obj,
                app,
                setHandler: setPlacementHandler,
            })
        }
        else {
            setPlacementHandler({
                type: PlacementHandlerType.Default,
                app,
                setHandler: setPlacementHandler,
            })
        }
    }

    return (
        <div className="flex p-4 flex-col items-center bg-base-100 rounded-lg h-full self-end">
            <PlacableObjectSelector
                selected={
                    placementHandler?.type === PlacementHandlerType.PlaceObject 
                        ? placementHandler.obj 
                        : undefined
                    }
                onSelect={onSelectObject}
            />

            <div className="fixed bottom-0 left-0 p-4 pointer-events-none select-none">
                <div className="flex flex-col text-white opacity-50">
                    { placementHandler && <PlacementHandler state={placementHandler} /> }
                </div>
            </div>
        </div>
    )
}

export default PlacementMode
*/