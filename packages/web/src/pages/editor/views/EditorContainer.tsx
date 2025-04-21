export function EditorContainer(props: { children: React.ReactNode; className?: string }) {
    return (
        <div className="flex flex-col">
            <div className="border-base-200 bg-base-300 pointer-events-auto rounded-2xl bg-opacity-80 backdrop-blur-md">
                <div className={"min-w-60  " + props.className}>{props.children}</div>
            </div>
        </div>
    )
}
