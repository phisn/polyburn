import { World } from "./World"


export interface ActionProps {
    world: World
    setIntermediateAction(action: ((props: ActionProps) => JSX.Element) | null): void
    setWorld(world: (p: World) => World): void
}
