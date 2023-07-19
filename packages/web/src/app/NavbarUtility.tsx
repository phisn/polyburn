"use client"

import { BrowserView } from "react-device-detect"
import { Link } from "react-router-dom"
import { Pencil } from "../common/inline-svg/Pencil"
import { Person } from "../common/inline-svg/Person"

export function NavbarUtility() {
    return (
        <>
            <BrowserView>
                <Link
                    to="/editor"
                    className="btn btn-ghost hidden text-zinc-500 sm:flex"
                >
                    Editor
                    <Pencil width="24" height="24" />
                </Link>
            </BrowserView>
            <div className="btn btn-ghost btn-square text-lg text-zinc-300">
                <Person width="24" height="24" />
            </div>
        </>
    )
}

