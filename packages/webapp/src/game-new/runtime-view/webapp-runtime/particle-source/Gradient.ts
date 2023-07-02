export type Gradient = GradientEntry[]

export interface GradientEntry {
    color: [number, number, number]
    time: number
}

export function colorInGradient(gradient: Gradient, position: number): [number, number, number] {
    if (gradient.length == 0) {
        return gradient[0].color
    }

    if (position <= gradient[0].time) {
        return gradient[0].color
    }

    if (position >= gradient[gradient.length - 1].time) {
        return gradient[gradient.length - 1].color
    }

    for (let i = 0; i < gradient.length - 1; i++) {
        if (position >= gradient[i].time && position <= gradient[i + 1].time) {
            const color1 = gradient[i].color
            const color2 = gradient[i + 1].color

            const ratio = (position - gradient[i].time) / (gradient[i + 1].time - gradient[i].time)

            return [
                color1[0] + (color2[0] - color1[0]) * ratio,
                color1[1] + (color2[1] - color1[1]) * ratio,
                color1[2] + (color2[2] - color1[2]) * ratio,
            ]
        }
    }

    return gradient[gradient.length - 1].color
}

export function invertGradient(gradient: Gradient): Gradient {
    return gradient.map(entry => {
        return {
            color: [
                1 - entry.color[0],
                1 - entry.color[1],
                1 - entry.color[2],
            ],
            time: entry.time
        }
    })
}

export function rgpRemixGradient(gradient: Gradient): Gradient {
    return gradient.map(entry => {
        return {
            color: [
                entry.color[2],
                entry.color[1],
                entry.color[0],
            ],
            time: entry.time
        }
    })
}
