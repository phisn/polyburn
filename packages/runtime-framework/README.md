# DD

Our framework is a list of entities where each entity has a list components. There are no systems, there are no events. The entity store can be easily extended using plugins. If you want to have an onUpdate method, you can create a component and iterate over all entities with this component. If you want an onCollision, you will do the same.
