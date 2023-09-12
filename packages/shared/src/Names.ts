const animals = [
    "Lion",
    "Tiger",
    "Wolf",
    "Fox",
    "Eagle",
    "Bull",
    "Bear",
    "Crocodile",
    "Whale",
    "Snake",
    "Shark",
    "Pig",
    "Ele",
]

const adjectives = [
    "Radiant",
    "Mystical",
    "Serene",
    "Energetic",
    "Whimsical",
    "Vibrant",
    "Enigmatic",
    "Tranquil",
    "Luminous",
    "Ethereal",
    "Captivating",
    "Majestic",
    "Vivacious",
    "Resplendent",
    "Hypnotic",
    "Mesmerizing",
    "Alluring",
    "Cosmic",
    "Celestial",
    "Dazzling",
    "Pulsating",
    "Breathtaking",
    "Sparkling",
    "Transcendent",
    "Glorious",
    "Spectacular",
    "Electric",
    "Charismatic",
    "Exquisite",
    "Dreamy",
    "Enchanted",
    "Spellbinding",
    "Awe-inspiring",
    "Fascinating",
    "Fantastic",
    "Stellar",
    "Mesmeric",
    "Divine",
    "Enchanting",
    "Magical",
    "Splendid",
    "Bewitching",
    "Enthralling",
    "Phenomenal",
    "Astonishing",
    "Marvelous",
    "Enrapturing",
    "Gorgeous",
    "Lustrous",
    "Irresistible",
    "Stunning",
    "Serendipitous",
]

function hash(base: number, str: string) {
    let hash = base

    for (let i = 0; i < str.length; ++i) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0
    }

    return hash
}

export function nameFromString(str: string) {
    const base1 = 0x211c9dc5
    const base2 = 0xf7aafd8a

    const animal = animals[hash(base1, str) % animals.length]
    const adjective = adjectives[hash(base2, str) % adjectives.length]

    return `${adjective} ${animal}`
}
