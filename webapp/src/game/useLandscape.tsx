
import { useEffect } from "react"
import { isMobile } from "react-device-detect"

export function useLandscape() {
    useEffect(() => {
        async function prepareMobile() {
            if (document.fullscreenElement === null) {
                await document.documentElement.requestFullscreen()
            }

            if (screen.orientation.type !== "landscape-primary" &&
                screen.orientation.type !== "landscape-secondary") {
                await screen.orientation.lock("landscape")
            }
        }
        
        if (isMobile) {
            prepareMobile().catch(console.error)
        
            return () => {
                screen.orientation.unlock()

                if (document.fullscreenElement !== null) {
                    document.exitFullscreen().catch(console.error)
                }
            }
        }

        return () => void 0
    }, [])
}
