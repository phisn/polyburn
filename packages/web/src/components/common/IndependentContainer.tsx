import { ReactNode } from "react"

export function IndependentContainer(props: { children: ReactNode; className?: string }) {
    return (
        <div className={"relative w-full " + props.className}>
            <div className="absolute inset-0">{props.children}</div>
        </div>
    )
}
