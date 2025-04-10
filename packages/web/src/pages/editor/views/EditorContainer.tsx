export function EditorContainer(props: { children: React.ReactNode; className?: string }) {
    return (
        <div className="flex h-full flex-col">
            <div className="border-base-200 bg-base-300 pointer-events-auto h-full rounded-2xl border-2 bg-opacity-90 backdrop-blur-md">
                <div className={"h-full min-w-60  " + props.className}>{props.children}</div>
            </div>
        </div>
    )
}
