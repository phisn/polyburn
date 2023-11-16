import { useEditorStore } from "./store"

export function useSelected() {
    return useEditorStore(store => store.selectedEntities())
}
