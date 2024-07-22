export function Container(props: { children: React.ReactNode; className?: string }) {
    return <div className="border-base-100 bg-base-300 border">{props.children}</div>
}
