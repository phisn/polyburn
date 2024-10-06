import { useRef } from "react"
import { PlayStore, PlayStoreProps, createPlayStore, playStoreContext } from "./play-store"

export function PlayStoreProvider(props: PlayStoreProps & { children: React.ReactNode }) {
    const storeRef = useRef<PlayStore | null>(null)

    if (!storeRef.current) {
        storeRef.current = createPlayStore(props)
    }

    return (
        <playStoreContext.Provider value={storeRef.current}>
            <>{props.children}</>
        </playStoreContext.Provider>
    )
}
