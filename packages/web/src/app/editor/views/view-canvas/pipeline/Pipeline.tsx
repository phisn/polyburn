import { usePipeline } from "./use-pipeline"

// needs to be its own component since we want to use three's context
export function Pipeline() {
    usePipeline()
    return <></>
}
