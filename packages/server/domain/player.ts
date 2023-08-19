interface Player {
    name: string
}

function renamePlayer(name: string): Partial<Player> {
    return { name }
}
