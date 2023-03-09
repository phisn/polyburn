import RAPIER from "@dimforge/rapier2d-compat"
import { createContext, useContext } from "react"

export const RapierContext = createContext<RAPIER.World | undefined>(undefined)

export function useRapier() {
    const rapier = useContext(RapierContext)

    if (rapier === undefined) {
        throw new Error("RapierContext not found")
    }

    return rapier
}
