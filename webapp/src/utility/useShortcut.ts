import { useEffect } from "react"

export function useShortcut(key: string, callback: () => void, deps: any[] = []) {
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === key) {
                callback()
            }

            e.preventDefault()
        }

        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, deps)
}
