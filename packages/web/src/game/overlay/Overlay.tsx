import { OrthographicCamera } from "three"
import { shallow } from "zustand/shallow"

import { ZoomInSvg } from "../../common/components/inline-svg/ZoomIn"
import { ZoomOutSvg } from "../../common/components/inline-svg/ZoomOut"
import { useGameStore } from "../store/GameStore"
import { canZoomIn, canZoomOut } from "../store/ZoomSteps"
import Map from "./Map"

export default function Overlay(props: { camera: OrthographicCamera }) {
    const [zoomIndex, zoomIn, zoomOut] = useGameStore(
        state => [state.zoomIndex, state.zoomIn, state.zoomOut],
        shallow,
    )

    return (
        <>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform p-4">
                <div className="flex select-none items-center">
                    <button
                        className={`btn btn-square btn-ghost select-none ${
                            !canZoomIn(zoomIndex) && "invisible"
                        }`}
                        onClick={zoomIn}
                    >
                        <ZoomInSvg className="h-6 w-6" />
                    </button>

                    <Map camera={props.camera} />

                    <button
                        className={`btn btn-square btn-ghost select-none ${
                            !canZoomOut(zoomIndex) && "invisible"
                        }`}
                        onClick={zoomOut}
                    >
                        <ZoomOutSvg className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </>
    )
}
