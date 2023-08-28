import { System } from "./System"
import { SystemFactory } from "./SystemFactory"

export class SystemStack<FactoryContext extends object, Context> {
    private _systems: System<Context>[] = []

    constructor(private _factoryContext: FactoryContext) {}

    public get factoryContext() {
        return this._factoryContext
    }

    public step(context: Context) {
        this._systems.forEach(system => system(context))
    }

    public add(...systemFactories: SystemFactory<FactoryContext, Context>[]) {
        this._systems.push(
            ...systemFactories
                .map(factory => factory(this._factoryContext))
                .filter((system): system is System<Context> => system !== undefined),
        )

        return this
    }

    public extend<ExtensionFactoryContext>(
        extension: ExtensionFactoryContext,
    ): SystemStack<FactoryContext & ExtensionFactoryContext, Context> {
        const newStack = new SystemStack<FactoryContext & ExtensionFactoryContext, Context>({
            ...this._factoryContext,
            ...extension,
        })

        newStack._systems = this._systems

        return newStack
    }
}
