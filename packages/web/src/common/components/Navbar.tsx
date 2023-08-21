// navbar with child content
export function Navbar(props: { children: React.ReactNode }) {
    return (
        <div className="bg-base-100 flex w-min items-center space-x-8 rounded-lg">
            {props.children}
        </div>
    )
}
