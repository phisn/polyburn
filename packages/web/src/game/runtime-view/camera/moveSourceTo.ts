export function moveSourceTo(distance: number, source: number, target: number) {
    if (source < target) {
        const newSource = source + distance

        if (newSource > target) {
            return { result: target, overflow: true }
        }

        return { result: newSource, overflow: false }
    } else {
        const newSource = source - distance

        if (newSource < target) {
            return { result: target, overflow: true }
        }

        return { result: newSource, overflow: false }
    }
}
