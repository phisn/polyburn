import { isMobile } from "react-device-detect"
import { GithubSvg } from "../../common/svg/Github"
import { NavbarAuthButton } from "./NavbarAuthButton"
import { Title } from "./Title"

export function Navbar() {
    const mobileClass = isMobile ? "" : "p-6"

    return (
        <div
            className={`bg-base-300 relative z-10 grid grid-cols-3 items-center bg-opacity-50 px-4 backdrop-blur-sm ${mobileClass}`}
        >
            <div
                className="btn btn-lg btn-ghost w-fit space-x-4"
                onClick={() => window.open("https://github.com/phisn/polyburn")}
            >
                <GithubSvg width="24" height="24" />
                <div className="xs:flex hidden">GitHub</div>
                {/*<BackArrowSvg width="48" height="48" />*/}
            </div>
            <div className="justify-self-center">
                <Title />
            </div>
            <div className="justify-self-end">
                <NavbarAuthButton />
            </div>
        </div>
    )
}
