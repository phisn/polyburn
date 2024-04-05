import { System } from "detect-collisions"
import { EntityWith } from "runtime-framework"
import { ExtendedComponents } from "../runtime-extension/components"
import { ExtendedRuntime } from "../runtime-extension/new-extended-runtime"
import { Input } from "./input"

export class Particles {
    private system: System
    private rocket: EntityWith<ExtendedComponents, "interpolation" | "rocket">

    constructor(
        runtime: ExtendedRuntime,
        private input: Input,
    ) {
        this.system = new System()

        for (const shapeEntity of runtime.factoryContext.store.find("shape")) {
            this.system.createPolygon(
                { x: 0, y: 0 },
                shapeEntity.components.shape.vertices.map(x => x.position),
            )
        }

        const [rocket] = runtime.factoryContext.store.find("rocket", "interpolation")
        this.rocket = rocket
    }

    update(delta: number) {
        if (this.input.thrust()) {
            this.system.separate
            this.system.createCircle(this.rocket.components.interpolation.position, 1)
        }
    }
}
