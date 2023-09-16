const animals = [
    "Lion",
    "Tiger",
    "Wolf",
    "Fox",
    "Eagle",
    "Bull",
    "Bear",
    "Crocodile",
    "Dog",
    "Snake",
    "Shark",
    "Cat",
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

    return Math.abs(hash)
}

export function nameFromString(str: string) {
    switch (str) {
        case "mbq3wRsTxGAMttLDolJSDRpomLtC54QADMrIeKjfX+92NR260ob0BUzMRp4H8l5vpLLvifnOAoJTX2MK0PlW2A==":
            return "Poccer77"
        case "HXHp2V+dAgZJydaA6wIlSpSK16f/jfRrM4sW6ZDb2LoAXqe7GJI9naLByKjjRYfsY/j+BJA24qlvujibrElXWg==":
            return "Monargoras"
        case "AYFjDgH8bdKuKaP2oBbaPa8yeCmgtYc2DJSReD75W0QRK4RiWdc6LXHCGPamQW9F+Ncn4k76/UXqBlDqhRof3w==":
            return "Phisn"
        case "B+iYPOXE4ZVl61Yku20ayRq88bdPfQ3dmDhaCFWI203Y1Ui2KugbzcnubVptid8MZIjsnYRiUqYccCQOzu8pyg==":
            return "Aelynna"
    }

    const base1 = 0x211c9dc5
    const base2 = 0xf7aafd8a

    const animal = animals[hash(base1, str) % animals.length]
    const adjective = adjectives[hash(base2, str) % adjectives.length]

    return `${adjective} ${animal}`
}
