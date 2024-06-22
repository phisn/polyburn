import { isMobile } from "react-device-detect"
import { AuthButton } from "../../components/common/auth-button/AuthButton"
import { BackArrowSvg } from "../../components/common/svg/BackArrow"
import { BoxArrowInRight } from "../../components/common/svg/BoxArrowInRight"
import { Layout } from "./Layout"
import { Title } from "./Title"

export function LayoutWithMenu() {
    return (
        <div
            className={"bg-base-300 flex h-screen w-screen flex-col " + (isMobile ? "pt-2" : "p-6")}
        >
            <Navbar />
            <Layout />
        </div>
    )
}

function Navbar() {
    function ResponsiveLoginButton() {
        return (
            <AuthButton className="btn btn-lg btn-square btn-ghost">
                <div className="flex items-center space-x-2">
                    <BoxArrowInRight width="40" height="40" className="pr-2" />
                </div>
            </AuthButton>
        )
    }

    return (
        <div className="grid grid-cols-3 items-center px-4">
            <div className="btn btn-lg btn-ghost btn-square">
                <BackArrowSvg width="48" height="48" />
            </div>
            <div className="justify-self-center">
                <Title />
            </div>
            <div className="justify-self-end">
                <ResponsiveLoginButton />
            </div>
        </div>
    )
}
