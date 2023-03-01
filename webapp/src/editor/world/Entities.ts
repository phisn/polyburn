import { EntityRegisterEntry, EntityRegistry, EntityType } from "./Entity";

export const entities: EntityRegistry = {
    [EntityType.Rocket]: {
        scale: 0.5,
        size: { width: 300, height: 600 },
        anchor: { x: 0.5, y: 1 },
        src: "rocket.svg",
    }
}
