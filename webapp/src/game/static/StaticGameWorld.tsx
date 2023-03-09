import { World } from "../../model/world/World"
import { Shape } from "./Shape"

interface StaticGameWorldProps {
    world: World
}

export function StaticGameWorld(props: StaticGameWorldProps) {
    return (
        <>
            {
                props.world.shapes.map((shape, index) => 
                    <Shape key={index} vertices={shape.vertices} />
                )
            }
        </>
    )
}
