
// concept: forget narrowing to optional all together. just provide only concrete types always
// internally we will use partial<t> and user does not bother with optionals
export type NarrowComponents<Components extends object, NarrowTo extends keyof Components> =
    { [K in NarrowTo]-?: Components[K] } & Components

