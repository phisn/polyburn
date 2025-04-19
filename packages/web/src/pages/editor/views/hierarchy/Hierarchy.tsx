import { EditorContainer } from "../EditorContainer"
import { HierarchyGamemodes } from "./HierarchyGamemodes"
import { HierarchyGroups } from "./HierarchyGroups"

export function Hierarchy() {
    return (
        <EditorContainer>
            <div className="pb-6 pt-4">
                <HierarchyGamemodes />
                <div className="divider" />
                <HierarchyGroups />
            </div>
        </EditorContainer>
    )
}
