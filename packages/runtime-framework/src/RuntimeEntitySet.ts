import { RuntimeEntity } from "./RuntimeEntity"

export interface RuntimeEntitySet extends Iterable<RuntimeEntity> {
    free(): void
}
