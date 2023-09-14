# Rocket Game

Rocket game is a simple but competetive deterministc rocket racing game including a map editor build as a web-app.

## Development

-   Install `yarn`
-   Run `yarn`
-   Run `yarn dev`

Website is running at `http://localhost:3000` and API is running at `http://localhost:3002`

## About

Rocket game in itself is a very simple obstacle game. Maps can be built using the editor and played by users. The core idea is that the physics are deterministic. This way we can ensure the validity of replays by replaying the inputs of users and therefore prevent cheating.

### State of Rocket-Game

Currently implemented is the editor, the game including replays and a server supporting a very primitive global fastest time for a few maps. Users can already make runs (playing and finishing a world) which then are uploaded and verified by the server. If the time is faster than the current record it is saved and displayed as the new global record. Other players can now see the current world record as a ghost (replay) flying around.

### Implementation

Rocketgame is implemented using `React`, `Threejs / React-Three-Fiber` and `Rapier` in its core (under `packages/web`) as a monorepo using `turbo`. The ECS (EntityComponentSystem) is a custom-written solution (under `packages/runtime` / `packages/runtime-framework`) to support the game with its deterministic requirements. Its written in a way where we can simulate the game on server-side without having to render any graphics. The server (under `packages/server`) is implemented with `Cloudflare Workers` and `d1` database with `trpc` to communicate between the frontend and backend.

Storage is partially optimized. Worlds and replays are binary saved using `protobuf`. The core size of worlds exists through vertices. These are reduced as 16 bit floats and saved only as deltas of the previous ones to improve precision. Replays are compressed using a custom made algorithm. Specifically the rotations are saved as either 16 bit float deltas or the repetition of empty deltas. This way we achieve a 4x compression ahead of gzip.
