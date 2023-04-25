import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Navbar from "../common/components/Navbar"
import useGlobalStore from "../common/GlobalStore"
import { StopFillSvg } from "../editor/Editor"
import Game from "../game/Game"
import { importWorld, WorldModel } from "../model/world/WorldModel"

function Play() {
    const [playingWorld, setPlayingWorld] = useState<WorldModel | null>(null)

    const onLevelSelect = (rawWorld: string) => {
        try {
            setPlayingWorld(importWorld(rawWorld))
        }
        catch (e) {
            useGlobalStore.getState().newAlert({
                type: "error",
                message: "Failed to load world"
            })
        }
    }

    const onLevelCancel = () => {
        setPlayingWorld(null)
    }

    if (playingWorld) {
        return (
            <>
                <Game world={playingWorld} />
                <div className="absolute top-0 left-0 p-4" style={{
                    touchAction: "none", 
                    userSelect: "none",

                    // Prevent canvas selection on ios
                    // https://github.com/playcanvas/editor/issues/160
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    WebkitTapHighlightColor: "rgba(255,255,255,0)",
                }}>
                    <Navbar>
                        <button className="btn btn-square btn-ghost"
                            onClick={onLevelCancel} >
                            <StopFillSvg />
                        </button>
                    </Navbar>
                </div>
            </>
        )
    }
    else {
        return (
            <LevelSelect onLevelSelect={onLevelSelect} />
        )
    }
}

interface LevelSelectProps {
    onLevelSelect: (world: string) => void   
}

function LevelSelect(props: LevelSelectProps) {
    const level1 = "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"
    const level2 = "E4dwPg3gRAzgFgQwA4FMZQFwG1oDcXAAuAlgMZqY5QAemAtAEwMB0AHKwDRQCe9ALMz4A2AL4dotDHQCMrNpx79Bo8TXrSB0oV15SNbBmImYW2xXunMA7HyNqpAVmYBOBjvpMDdyTIfupDADMzAAMogC6dvhEZBTYxlJ8zsyBZroyLraqPsLWaSbMst78gf50AjbFUoFW1m7mllZV5SGF9elODqzNgZbO+Y7WPSyB7eqt0j21YxbKzbkOA3RylZGq0STk6PH2dA5ODHz+stZZCXtO/cfBGs1ClqPHLLfZ9PfMM/pNr1JWNwMnBxnXZWWohI4NMGGH50KzJIQQ3TSG7NVitIQKJECITQ85o0KIzAnSYwoTJK7mBitZzNIGCTEmFhWbowhytEIMjDSZKsXG7QLJBicoIuZoMZz+EVhZrSFgcyWWPh8nzUz5yZzAyQixaSljOFkJIX0461IFVBhCPLHAQhZVEiXmOSBKrSJyPBosM0/AQOGbJBy0woAvrzZgY/zJaUwrSCQkYFZipyyp5sFTncVhzmCtP80wpi3zFh8Tk3TX8S1WP2ZWnYzmMMN2xxgznUg27X2hTmurxrPAETZxKg+RYfOu1DW0lhCsrjsuJUrmGQPOflSzJxcx4Q9dFlGO8qbGxcMRrzS3g3e1Vg54c2uOMNe2XtQDaxbZD+i9FIzGQ3Ns+KV3rKzBeuc3KxmUVKnImLjfseYbXh+Sawa0SoiE+L5bJQ5yXnWnhXuaHxlJof4ePIxxeD8KFxsE+pVHIOqLqWLofIB44kRgTKwaYhjof2r5YbsQhOMWEGhAhUg4p2ZSWkI4l0EItQiYuZ5yQpMFlHI+4wjYdQzvBzQ6a4olFLxMSYTsPisAIVn+Accm8l+CofI2sKWr6JpQTCrB9AC1baTyZQTOxyxUURLjBawwSVnptqopY04biw+HabUCK7pYIGCXI54btZLkIlaG7BM6pK1Kku4Jqy/pLHB3x4k44Ybv63SmQOb6GqYgGWMlhoyV1qbmis37drRPyHGGgFOPhrX8RZmDwnGyLAexDAHItlUJKMh5IskW4/IEwlZnMY27XePpzjGjXpK0+4zeZ75cpoMytIEF2aXWcgvAk0g4elQw/MkWh/ZMd2DoachxpagTsVtkMpCt9EAqY4kHY5DTBFGCRKgS/iWl99g1OpDT/ZtlhXZgrRdFUgQ3YBoSNoEwTfpGKOtNFiXAeaVi7q0BZjVNokTvtKGSvDaFRHx90JKayGFOx3ZpRueMup0NWti6cp3iKPX2D9bAQZ9K1k7h3UM0WgHJCVm1uUs0gPtT1m7sBc6o+VG7HdbKRLMr3qW8NlxVA4ZO7lFgdrksPLiSO8qLkmc4YlJsfOVUViKnWdsNnR4d/UwKffjTnM/OOSwF6NCT+rBxHi+EXAoAAdiQJBg1AhDcKgmBQAASigAAmAAEABiAA2CAAOZQFwpAIAAtgQCAACoAPZIAAMigABmhCYOcn5A5CztiFAU+z8ACAAEKL4QhCL9PnfEKPcBbxgm284Bn0BpPyCEAArsAKBr5vEwn8kA/z/nfB+T96hIEXjAYgJBF5123rsTwYQnZWUPsAS+CB4GIIwCEOwrd24YC7r3QeI9x6fxPgvZeACn7lxYv4AQfAP5HxnnPC+V8b7gMfkg9IRphBcEkFYXmh8p4gN/v/DekDgGgJQNw6RUBoGwJwUgrUwQ+DSDKIKLIUBMGEGwcQBBFMCFtxQB3bu/dh5jwnqwqhS9V5SNUZgPgZUAROBCCSWx7DL7X1vvfHhz97Cgi9ruAQzgaQyIkbQoBrDxFgP8QopRcDDG4ISA4U0fgjzARKrorBKipDshJNAQhZjiEWLIdYyhc97HRMCUiVKZhLKemhF40+HDfHyN4eoQ2gj1CdBaWI2RtT6iDIkZ0jiXAkn5OwgIII/gUIsL0QYoxeDQhFJbqY8xi9SAAGsUBb0mTA5JKzsLUnIi4jBeSUkUzWeLIAA="

    const navigate = useNavigate()

    return (
        <>
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-base-300 p-6 rounded-xl space-y-4">
                        <button 
                            className="btn btn-primary btn-block" 
                            onClick={() => props.onLevelSelect(level1)}>
                            Level 1
                        </button>
                        <button 
                            className="btn btn-primary btn-block"
                            onClick={() => props.onLevelSelect(level2)}>
                            Level 2
                        </button>
                        <button 
                            className="btn btn-ghost btn-block"
                            onClick={() => navigate("/editor")}>
                            Import
                        </button>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default Play
