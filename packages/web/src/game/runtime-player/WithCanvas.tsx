import { Canvas } from "@react-three/fiber"
import { ComponentType, CSSProperties } from "react"

export function withCanvas<Props extends object>(Component: ComponentType<Props>) {
    return function WithCanvas(props: Props) {
        return (
            <GameCanvas>
                <Component {...props} />
            </GameCanvas>
        )
    }
}

const canvasStyle: CSSProperties = {
    msTouchAction: "manipulation",
    touchAction: "none",
    userSelect: "none",

    // Prevent canvas selection on ios
    // https://github.com/playcanvas/editor/issues/160
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    WebkitTapHighlightColor: "rgba(255,255,255,0)",
}

function GameCanvas(props: { children: React.ReactNode }) {
    return (
        <div className="h-full select-none" style={canvasStyle}>
            <Canvas
                className=""
                style={{
                    ...canvasStyle,
                    background: "#000000",
                }}
            >
                {props.children}
            </Canvas>
        </div>
    )
}
