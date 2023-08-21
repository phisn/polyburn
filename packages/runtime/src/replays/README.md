# Replay concept

Replay make out the majority of data to be stored in rocket game. therefore it is a priority to find a minimal data model for storing replays. Normally we need to store one float for rotation and one byte for thrust per frame. We improve this by reducing the rotation number to 10 - 12 bits and 4 - 6 bits for length (frames in number). Normally rotation while playing does not change instantly, but more slowly with small steps. We only save the change between rotation on each frame and give more precision to smaller numbers similiar to how floats work.
