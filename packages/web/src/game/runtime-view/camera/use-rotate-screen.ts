import { useEffect, useState } from "react"

export function useRotateScreen() {
    const [rotated, setRotated] = useState(false)

    useEffect(() => {
        const listener = () => {
            switch (screen.orientation.type) {
                case "landscape-primary":
                case "landscape-secondary":
                    setRotated(false)
                    break
                case "portrait-primary":
                case "portrait-secondary":
                    setRotated(true)
                    break
            }
        }

        listener()
        screen.orientation.addEventListener("change", listener)

        return () => {
            screen.orientation.removeEventListener("change", listener)
        }
    }, [])

    return rotated
}
