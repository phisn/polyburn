# Game layer rework

## Runtime
- We have a store of rigidbodies. The only change notified by the store is in adding and removing
  rigidbodies. The idea is that we allow react to react on these changes. Internal changes should
  be updated per frame when the entity is not sleeping.
- We use a store in the generel runtime framework. So zustand will be used at serverside. This as
  a new addition can be seen as new implicit events. 