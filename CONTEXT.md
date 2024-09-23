# Context

## Now

-   I renamed web-game to game-player. Have to fix everything upon that.
-   We wanted to extract reset functionality into game-web. Game should stay more pure. Especially since we have the bug that camera does not reset on reset call. For this also take a look if player in web should actually have such deep access. ALl sketchy.

## Next

-   Split game-player so that we dont have settings in this way anymore. We use modules more independently
-   Refactor how interpolation works. We where thinking about doing it using components. Maybe extend the game entities into our own entities?

## Later

-   Redo game-web ui using react
-   Redo multiplayer using rust on server
-   Do polish everything. Includes. Low latency using deferred fetch. Better PWA support.
