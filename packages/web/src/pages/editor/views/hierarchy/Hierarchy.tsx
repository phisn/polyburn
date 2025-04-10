import { ChevronDown } from "../../../../components/common/svg/ChevronDown"
import { ChevronRightSvg } from "../../../../components/common/svg/ChevronRight"
import { LayersSvg } from "../../../../components/common/svg/Layers"
import { useEditorStore } from "../../store/store"
import { EditorContainer } from "../EditorContainer"

export function Hierarchy() {
    const world = useEditorStore(x => x.world)

    return (
        <EditorContainer>
            <div>
                <div className="p-4 text-gray-400">Gamemodes</div>
                <div>
                    <Entry>Normal</Entry>
                    <div>
                        <Entry open>Reverse</Entry>
                        <div className="py-1">
                            <div className="hover:bg-base-200 flex items-center space-x-2 px-4 py-1 pl-8 transition hover:cursor-pointer">
                                <LayersSvg width="16" height="16" />
                                <div>Shapes</div>
                            </div>
                            <div className="hover:bg-base-200 flex items-center space-x-2 px-4 py-1 pl-8 transition hover:cursor-pointer">
                                <LayersSvg width="16" height="16" />
                                <div>Reverse</div>
                            </div>
                        </div>
                    </div>
                    <Entry>Hard</Entry>
                </div>
                <div className="divider" />
                <div className="p-4 text-gray-400">Groups</div>
                <div>
                    <Entry>Shapes</Entry>
                    <Entry>Normal</Entry>
                    <Entry>Normal Rocket</Entry>
                    <Entry>Hard Rocket</Entry>
                    <Entry>Reverse</Entry>
                </div>
            </div>
        </EditorContainer>
    )
}

function Entry(props: { children: React.ReactNode; open?: boolean }) {
    return (
        <div className="hover:bg-base-200 flex items-center space-x-2 px-4 py-2 transition hover:cursor-pointer">
            {props.open && <ChevronDown width="16" height="16" />}
            {!props.open && <ChevronRightSvg width="16" height="16" />}
            <div>{props.children}</div>
        </div>
    )
}
