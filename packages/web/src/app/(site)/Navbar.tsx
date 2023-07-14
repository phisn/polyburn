import { NavbarUtility } from "./NavbarUtility"

export function Navbar() {
    return (
        <div className="row-start-1 flex w-full justify-between bg-black px-8">
            <div className="cursor-default select-none p-4 text-xl text-zinc-300">
                Rocket Game
            </div>
            <div className="flex self-center">
                <NavbarUtility />
            </div>
        </div>
    )
}
