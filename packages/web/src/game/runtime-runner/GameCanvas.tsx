import { Canvas } from "@react-three/fiber"
import { WebappSystemStack } from "../runtime-webapp/WebappSystemStack"

export function GameCanvas(props: {
    children?: React.ReactNode
    update: () => void
    stack: WebappSystemStack
}) {
    return (
        <div
            className="h-full select-none"
            style={{
                msTouchAction: "manipulation",
                touchAction: "none",
                userSelect: "none",

                // Prevent canvas selection on ios
                // https://github.com/playcanvas/editor/issues/160
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "rgba(255,255,255,0)",
            }}
        >
            <Canvas
                className=""
                style={{
                    msTouchAction: "manipulation",
                    background: "#000000",
                    touchAction: "none",
                    userSelect: "none",

                    // Prevent canvas selection on ios
                    // https://github.com/playcanvas/editor/issues/160
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    WebkitTapHighlightColor: "rgba(255,255,255,0)",
                }}
                /*
            onClick={async e => {
                const target = e.target as HTMLCanvasElement

                if (document.pointerLockElement !== target) {
                    target.requestPointerLock()
                }
            }}
            */
            >
                {props.children}
            </Canvas>
        </div>
    )
}
