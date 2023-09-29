import { System } from "./System"

export type SystemFactory<FactoryContext, Context, K = void> = (
    factoryContext: FactoryContext,
) => System<Context, K> | void
