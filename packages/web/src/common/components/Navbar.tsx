// navbar with child content
export function Navbar(props: { children: React.ReactNode }) {
    return (
        <div className="flex w-min items-center space-x-8 rounded-lg border-[1px] border-zinc-900 bg-black">
            {props.children}
        </div>
    )
}
