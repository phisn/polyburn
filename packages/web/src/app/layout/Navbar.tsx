import { Link } from "react-router-dom"
import { NavbarUtility } from "./NavbarUtility"

export function Navbar() {
    return (
        <div className="row-start-1 flex w-full justify-between bg-black sm:px-8">
            <div className="cursor-default select-none p-2 text-xl text-zinc-300">
                <Link to="/campaign" className="btn btn-ghost text-lg">
                    Rocket Game
                </Link>
            </div>
            <div className="flex self-center">
                <NavbarUtility />
            </div>
        </div>
    )
}
