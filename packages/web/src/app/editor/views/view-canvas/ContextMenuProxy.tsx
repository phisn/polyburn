import { Html } from "@react-three/drei"
import { useEditorStore } from "../../store/store"

export function ContextMenuProxy() {
    const contextMenu = useEditorStore(s => s.contextMenu)

    return (
        <>
            {contextMenu && (
                <Html position={[contextMenu.point.x, contextMenu.point.y, 0]} className="-m-4">
                    <contextMenu.element />
                </Html>
            )}
        </>
    )
}
