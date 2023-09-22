import { System } from "./System"

export type SystemFactory<FactoryContext, Context> = (
    factoryContext: FactoryContext,
) => System<Context> | void
