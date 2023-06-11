
export type NarrowComponents<Components extends object, NarrowTo extends keyof Components> =
    { [K in NarrowTo]-?: Components[K] } & Components

export type NarrowComponentsOptional<Components extends object, NarrowTo extends keyof Components | undefined> =
    (NarrowTo extends keyof Components ? { [K in NarrowTo]-?: Components[K] } : never) & Components
