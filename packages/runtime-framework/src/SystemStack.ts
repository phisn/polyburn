import { System } from "./System"
import { SystemFactory } from "./SystemFactory"

export class SystemStack<FactoryContext extends object, Context> {
    private systems: System<Context>[] = []

    constructor(private factoryContext: FactoryContext) {}

    public step(context: Context) {
        this.systems.forEach(system => system(context))
    }

    public add(...systemFactories: SystemFactory<FactoryContext, Context>[]) {
        this.systems.push(
            ...systemFactories
                .map(factory => factory(this.factoryContext))
                .filter((system): system is System<Context> => system !== undefined),
        )

        return this
    }

    public extend<ExtensionFactoryContext>(
        extension: ExtensionFactoryContext,
    ): SystemStack<FactoryContext & ExtensionFactoryContext, Context> {
        const newStack = new SystemStack<FactoryContext & ExtensionFactoryContext, Context>({
            ...this.factoryContext,
            ...extension,
        })

        newStack.systems = this.systems

        return newStack
    }
}
