import { DependencyList, useEffect } from "react"
import { EntityWith, NarrowProperties } from "runtime-framework"

type InferGraphics<C, N extends keyof C> = C[N] extends { graphics?: infer R } | undefined
    ? R
    : never

export function useGraphicsProvider<C extends object, N extends keyof C>(
    entity: EntityWith<C, N>,
    componentName: N,
    accessor: () => InferGraphics<NarrowProperties<C, N>, N>,
    deps?: DependencyList,
) {
    useEffect(
        () => {
            const component = entity.components[componentName] as { graphics?: unknown }
            component.graphics = accessor()
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps ?? [],
    )
}
