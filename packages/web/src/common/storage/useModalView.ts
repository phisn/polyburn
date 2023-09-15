import { useEffect } from "react"
import { useAppStore } from "./AppStore"

export function useModalView(open: boolean) {
    useEffect(() => {
        if (open) {
            useAppStore.setState(state => ({
                modalCount: state.modalCount + 1,
            }))
        }

        return () => {
            useAppStore.setState(state => ({
                modalCount: state.modalCount - 1,
            }))
        }
    }, [open])
}
