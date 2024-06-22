type AlertType = "warning" | "error" | "info" | "success"

export interface AlertProps {
    message: string
    type: AlertType
}

const successSvg = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 flex-shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
)

const errorSvg = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 flex-shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
)

const infoSvg = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="h-6 w-6 flex-shrink-0 stroke-current"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
    </svg>
)

const warningSvg = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 flex-shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
    </svg>
)

export function Alert(props: AlertProps) {
    return (
        <div className="relative">
            <div className={`alert ${alertClassName(props.type)} bg-clip-border`}>
                {/*
                <Transition
                    appear={true} show={true}
                    as={(Fragment as any) as undefined}
                    enter="transition-[width] ease-out duration-[3000ms]"
                    enterFrom="transform w-full"
                    enterTo="transform w-0">
                
                    <div className="absolute right-0 h-full bg-black opacity-10" />
                </Transition>
                */}

                <AlertSvg type={props.type} />

                <span>{props.message}</span>
            </div>
        </div>
    )
}

function AlertSvg(props: { type: AlertType }) {
    switch (props.type) {
        case "success":
            return successSvg
        case "error":
            return errorSvg
        case "info":
            return infoSvg
        case "warning":
            return warningSvg
    }
}

function alertClassName(type: AlertType) {
    switch (type) {
        case "success":
            return "alert-success"
        case "error":
            return "alert-error"
        case "info":
            return "alert-info"
        case "warning":
            return "alert-warning"
    }
}
