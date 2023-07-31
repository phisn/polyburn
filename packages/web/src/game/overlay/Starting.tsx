import { BrowserView, MobileView } from "react-device-detect"
import { useGameStore } from "../store/GameStore"

export function Starting() {
    const started = useGameStore(state => state.started)

    if (started) {
        return null
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 top-0 cursor-default select-none backdrop-saturate-[0.35]">
            <BrowserView>
                <div className="absolute bottom-0 left-0 right-0 top-0 flex h-min justify-center pt-16">
                    <div className="rounded-2xl bg-black bg-opacity-30 p-8 text-2xl text-zinc-200 backdrop-blur-xl">
                        {/* space is for thrust */}
                        Thrust with <kbd className="kbd kbd-md mx-1">Space</kbd> to start
                    </div>
                </div>
            </BrowserView>
            <MobileView>
                <div className="absolute bottom-0 left-0 right-0 top-0 flex h-min justify-center pt-4">
                    <div className="rounded-2xl bg-black bg-opacity-30 p-8 text-center text-2xl text-zinc-200 backdrop-blur-xl">
                        {/* right half of screen is for thrust */}
                        Thrust by tapping the right half <br /> of the screen to start
                    </div>
                </div>
            </MobileView>
        </div>
    )
}
