import { System } from "./system"

export type SystemFactory<FactoryContext, Context, K = void> = (
    factoryContext: FactoryContext,
) => System<Context, K> | void
