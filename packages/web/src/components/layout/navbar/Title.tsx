import { isMobile } from "react-device-detect"
import { useLocation } from "react-router-dom"
import { Logo, LogoWithText } from "../../common/Logo"

export function Title() {
    const { pathname } = useLocation()

    return (
        <div className="font-outfit flex items-center">
            {isMobile && <Logo className="" />}
            {!isMobile && <LogoWithText />}
            <div className={"self-end text-sm " + (isMobile ? "pb-0.5 pl-1" : "pb-1 pl-2")}>
                {pathname.slice(1).toUpperCase()}
            </div>
        </div>
    )
}
