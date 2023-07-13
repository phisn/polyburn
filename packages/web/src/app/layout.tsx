import { Pencil } from "../common/inline-svg/Pencil"
import { Person } from "../common/inline-svg/Person"
import "./global.css"

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" className="bg-base-300 grid">
            <div className="row-start-1 flex w-full justify-between bg-black px-8">
                <div className="p-4 text-xl text-zinc-300">Rocket Game</div>
                <div className="flex self-center">
                    <div className="btn btn-ghost hidden text-lg text-zinc-500 md:flex">
                        Editor
                        <Pencil width="24" height="24" />
                    </div>
                    <div className="btn btn-ghost btn-square text-lg text-zinc-500">
                        <Person width="24" height="24" />
                    </div>
                </div>
            </div>
            <body>{props.children}</body>
        </html>
    )
}
