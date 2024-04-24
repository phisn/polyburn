import { Outlet, useLocation } from "react-router-dom"
import { AuthButton } from "../../common/components/auth-button/AuthButton"
import { BoxArrowInRight } from "../../common/components/inline-svg/BoxArrowInRight"
import { useAppStore } from "../../common/storage/app-store"
import { Alert } from "./Alert"

function Icon(props: { className?: string }) {
    return (
        <svg
            className={props.className}
            xmlns="http://www.w3.org/2000/svg"
            id="eVjCW2NZqmM1"
            width={20}
            height={20}
            viewBox="0 0 300 300"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
        >
            <ellipse
                rx="32.148663"
                ry="33.683538"
                transform="matrix(2.021857 0 0 1.929726 235 64.999999)"
                fill="#f8c171"
                strokeWidth="0"
            />
            <ellipse
                rx="32.148663"
                ry="33.683538"
                transform="matrix(2.021857 0 0 1.929726 235 235.000001)"
                fill="#848484"
                strokeWidth="0"
            />
            <ellipse
                rx="32.148663"
                ry="33.683538"
                transform="matrix(2.021857 0 0 1.929726 64.999999 150)"
                fill="#f87171"
                strokeWidth="0"
            />
        </svg>
    )
}

function Logo() {
    const { pathname } = useLocation()

    const isCampaign = pathname.includes("campaign")

    return (
        <div className="font-outfit flex h-min flex-initial items-center justify-center p-6 text-3xl">
            <Icon className="mx-2" />
            Poly<div className="text-red-400">burn</div>
            {isCampaign && <div className="self-end pb-1 pl-2 text-sm">CAMPAIGN</div>}
        </div>
    )
}

export function LayoutWithMenu() {
    function ResponsiveLoginButton() {
        return (
            <AuthButton className="btn btn-outline btn-square hxs:w-auto hxs:h-auto hxs:pr-3 relative z-20 px-2">
                <div className="flex items-center space-x-2">
                    <BoxArrowInRight width="30" height="30" className="pr-1" />
                    <div className="hxs:block hidden">LOGIN</div>
                </div>
            </AuthButton>
        )
    }

    return (
        <div className="bg-base-300 flex h-screen w-screen">
            <div className="relative grow">
                <Layout />
            </div>
            <div className="hxs:absolute hxs:pr-5 hxs:w-full flex justify-end pr-2 pt-6">
                <ResponsiveLoginButton />
            </div>
        </div>
    )
}

export function Layout() {
    const existsModal = useAppStore(state => state.modalCount > 0)

    return (
        <>
            <div
                className={`bg-base-300 absolute inset-0 flex flex-col justify-center ${existsModal && "h-screen overflow-hidden"}`}
            >
                <div className="hxs:flex relative hidden h-24 items-center justify-center">
                    <Logo />
                </div>
                <Outlet />
                <LayoutAlerts />
            </div>
        </>
    )
}

function LayoutAlerts() {
    const alerts = useAppStore(state => state.alerts)

    return (
        <div className="toast z-50">
            {alerts.map((alertProps, i) => (
                <Alert key={i} {...alertProps} />
            ))}
        </div>
    )
}
