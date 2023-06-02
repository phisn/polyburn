import { EntityStore } from "./EntityStore"
import { System } from "./System"
import { SystemFactory } from "./SystemFactory"

export class SystemStack<Meta, T> {
    private systems: System<T>[] = []
    
    constructor(
        private store: EntityStore,
        private meta: Meta) {
    }

    public step(context: T) {
        this.systems.forEach(system => system(context))
    }

    public add(...systemFactories: SystemFactory<Meta, T>[]) {
        this.systems.push(
            ...systemFactories
                .map(factory => factory(this.store, this.meta))
                .filter((system): system is System<T> => system !== undefined)
        )

        return this
    }
}