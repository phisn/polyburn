import { useGlobalStore } from "../../common/store"

export function Modals() {
    const modals = useGlobalStore(state => state.modals)
    return modals.map((x, i) => <x.modal key={i} />)
}
