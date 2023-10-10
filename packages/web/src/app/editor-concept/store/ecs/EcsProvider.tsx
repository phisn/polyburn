import { useEffect, useRef } from "react"
import { createEntityStore } from "runtime-framework"
import { EditorComponents } from "../../runtime-ecs/base"
import { useEditorStore } from "../StoreProvider"

export function EcsProvider() {
    const view = useEditorStore(store => store.view)
    const ecsRef = useRef(createEntityStore<EditorComponents>())

    useEffect(() => {}, [view])
}
