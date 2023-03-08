
// navbar with child content
function Navbar(props: { children: React.ReactNode }) {
    return (
        <div className="flex w-min space-x-8 items-center bg-base-100 rounded-lg">
            { props.children }
        </div>
    )
}

export default Navbar
