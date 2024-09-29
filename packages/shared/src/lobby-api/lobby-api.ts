// limit of amount of positions to be received from the client
export const UPDATE_POSITIONS_EVERY_MS = 250
export const UPDATE_POSITIONS_COUNT = Math.floor(60 * (UPDATE_POSITIONS_EVERY_MS / 1000))

export function lobbyId(worldname: string, gamemode: string) {
    return `${worldname}-${gamemode}`
}

export function parseLobbyId(lobbyId: string) {
    const [worldname, gamemode] = lobbyId.split("-")
    return { worldname, gamemode }
}
