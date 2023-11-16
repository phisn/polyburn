import { useEffect } from "react"

export function usePreventUnload() {
    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = "Are you sure you want to leave? You will lose unsaved changes."
        }

        window.addEventListener("beforeunload", onBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload)
        }
    }, [])
}
