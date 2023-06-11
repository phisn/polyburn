import { NarrowComponents } from "./NarrowComponents"

export interface Entity<Components extends object> {
    get components(): Components
    get id(): number

    has<T extends (keyof Components)[]>(...components: [...T]): this is Entity<NarrowComponents<Components, typeof components[number]>>
}
