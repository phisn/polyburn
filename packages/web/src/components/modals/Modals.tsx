import { useAppStore } from "../../common/store/app-store"

export function Modals() {
    const modals = useAppStore(state => state.modals)

    return modals.map((x, i) => <x.modal key={i} />)
}
