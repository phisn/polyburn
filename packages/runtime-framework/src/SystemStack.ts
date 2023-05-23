import { RuntimeSystem } from "./RuntimeSystem"

export class SystemStack<T> {
    private systems: RuntimeSystem<T>[]
    
    constructor(
        ...systems: RuntimeSystem<T>[]
    ) { 
        this.systems = systems
    }

    public step(context: T) {
        this.systems.forEach(system => system(context))
    }
}