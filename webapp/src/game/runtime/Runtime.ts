import RAPIER from "@dimforge/rapier2d-compat"

import { EntityType } from "../../model/world/EntityType"
import { FlagEntity } from "../../model/world/FlagModel"
import { Point } from "../../model/world/Point"
import { WorldModel } from "../../model/world/WorldModel"
import { ColliderType } from "./ColliderType"
import { RuntimeLevel } from "./entity/RuntimeLevel"
import { RuntimeRocket } from "./entity/RuntimeRocket"
import { createShape } from "./entity/RuntimeShape"
import { RuntimeFutures } from "./RuntimeFutures"
import { runtimeHandlers } from "./RuntimeHandler"
import { RuntimeMetaState, RuntimeState } from "./RuntimeState"
import { StepContext } from "./StepContext"


export class Runtime {
    get state() { return this._state }

    constructor(world: WorldModel) {
        const metaState = this.createMetaState()
        
        const rocket = new RuntimeRocket(
            metaState,
            world
        )
        
        world.shapes.forEach(shape => 
            createShape(metaState, shape)
        )
    
        const flags = world.entities
            .filter(entity => entity.type === EntityType.RedFlag) as FlagEntity[]

        if (flags.length === 0) {
            throw new Error("No flags found")
        }

        const levels = flags.map(
            flag => new RuntimeLevel(metaState, flag)
        )

        const firstLevel = this.findFirstLevel(levels, rocket)
        firstLevel.unlockLevel()

        this._state = new RuntimeState(
            levels,
            firstLevel,
            rocket,
            metaState
        )
    }
    
    step(context: StepContext) {
        for (const handler of runtimeHandlers) {
            handler(this.state, context)
        }

        this.state.meta.rapier.step(this.state.meta.queue)
        this.state.meta.futures.step()
    }

    private findFirstLevel(levels: RuntimeLevel[], rocket: RuntimeRocket) {
        const distanceToRocket = (l: Point) =>
            Math.sqrt(
                Math.pow(l.x - rocket.body.translation().x, 2) +
                Math.pow(l.y - rocket.body.translation().y, 2)
            )

        let level: RuntimeLevel | undefined = levels[0]
        let levelDistance = distanceToRocket(level.flag)

        for (let i = 1; i < levels.length; i++) {
            const currentLevel = levels[i]
            const currentLevelDistance = distanceToRocket(currentLevel.flag)

            if (currentLevelDistance < levelDistance) {
                level = currentLevel
                levelDistance = currentLevelDistance
            }
        }

        return level
    }

    private createMetaState(): RuntimeMetaState {
        const rapier = new RAPIER.World({ 
            x: this.gravityHorizontal,
            y: this.gravityVertical
        })

        return {
            handleToEntityType: new Map<number, ColliderType>(),
            
            rapier,
            queue: new RAPIER.EventQueue(true),
            futures: new RuntimeFutures,

            tickRate: this.tickRate
        }
    }
    
    private readonly gravityVertical = -20
    private readonly gravityHorizontal = 0
    private readonly tickRate = 16.6667

    private _state: RuntimeState
}
