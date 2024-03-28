import { CSSProperties, Suspense, useEffect, useRef, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { TrpcProvider } from "../common/trpc/TrpcProvider"
import { NotFound } from "./NotFound"
import { Campaign } from "./campaign/Campaign"
import LoadingIndicator from "./campaign/LoadingIndicator"
import { Editor } from "./editor/Editor"
import { Layout } from "./layout/Layout"

export function App() {
    return (
        <TrpcProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<Navigate to="/campaign" replace />} />
                    <Route path="/campaign" element={<Campaign />} />
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </TrpcProvider>
    )
}

// import { runGame } from "rust-game"

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

function Test() {
    return (
        <div className="absolute inset-0">
            <Suspense
                fallback={
                    <div>
                        <div className="loading loading-spinner loading-lg" />
                    </div>
                }
            >
                <GameWindow />
            </Suspense>
        </div>
    )
}

function GameWindow() {
    const gameRef = useRef<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        import("rust-game").then(game => {
            gameRef.current = game

            setTimeout(() => {
                setLoading(false)
            }, 100)
        })
    }, [])

    return (
        <>
            <canvas
                id="canvas"
                style={{
                    ...canvasStyle,
                    height: "100%",
                    width: "100%",
                    background: "#000000",
                }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <LoadingIndicator
                    loading={loading}
                    onAnimationEnd={() => {
                        gameRef.current.runGame()
                    }}
                />
            </div>
        </>
    )
}
