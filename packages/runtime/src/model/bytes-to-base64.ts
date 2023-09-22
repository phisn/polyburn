export function bytesToBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, x => String.fromCodePoint(x)).join("")
    return btoa(binString)
}
