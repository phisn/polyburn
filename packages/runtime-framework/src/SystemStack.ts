import { EntityStore } from "./EntityStore"
import { System } from "./System"
import { SystemFactory } from "./SystemFactory"

export class SystemStack<Components extends object, Meta, Context> {
    private systems: System<Context>[] = []
    
    constructor(
        private store: EntityStore<Components>,
        private meta: Meta) {
    }

    public step(context: Context) {
        this.systems.forEach(system => system(context))
    }

    public add(...systemFactories: SystemFactory<Components, Meta, Context>[]) {
        this.systems.push(
            ...systemFactories
                .map(factory => factory(this.store, this.meta))
                .filter((system): system is System<Context> => system !== undefined)
        )

        return this
    }
}