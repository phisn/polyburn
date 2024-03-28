import { useEffect } from "react"
import { useAppStore } from "./app-store"

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
