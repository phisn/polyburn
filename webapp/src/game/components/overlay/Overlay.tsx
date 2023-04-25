import { OrthographicCamera } from "three"
import { shallow } from "zustand/shallow"

import { ZoomInSvg } from "../../../common/svg/ZoomInSvg"
import { ZoomOutSvg } from "../../../common/svg/ZoomOutSvg"
import { canZoomIn, canZoomOut, useGameStore } from "../../store/GameStore"
import MapOverlay from "./MapOverlay"

export default function Overlay(props: { 
    camera: OrthographicCamera,
}) {
    const [zoomIndex, zoomIn, zoomOut] = useGameStore(state => [ 
        state.zoomIndex,
        state.zoomIn,
        state.zoomOut 
    ], shallow)

    return (
        <div className="absolute bottom-0 left-1/2 p-4 transform -translate-x-1/2">
            <div className="flex items-center select-none">
                <button className={`btn btn-square btn-ghost select-none ${!canZoomIn(zoomIndex) && "invisible"}`}
                    onClick={zoomIn}>
                    <ZoomInSvg className="w-6 h-6" />
                </button>

                <MapOverlay camera={props.camera} />
                            
                <button className={`btn btn-square btn-ghost select-none ${!canZoomOut(zoomIndex) && "invisible"}`}
                    onClick={zoomOut}>
                    <ZoomOutSvg className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
