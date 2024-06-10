export type System<Events extends object> = Partial<Events>

export type SystemStack<Events extends object> = Partial<Events> & {
    add(system: Partial<Events>): void
}

export function newSystemStack<Events extends object>(): SystemStack<Events> {
    const systems = new Map()

    function add(system: Partial<Events>) {
        const possibleEvents = Object.getOwnPropertyNames(system).filter(
            x => typeof system[x as keyof Events] === "function",
        )

        for (const property of possibleEvents as (keyof Events)[]) {
            const existing = systems.get(property)
            const rawMethod = system[property]

            if (typeof rawMethod !== "function") {
                throw new Error(`Method ${property.toString()} is not defined`)
            }

            const method = rawMethod.bind(system)

            if (existing) {
                existing.push(method)

                if (existing.length === 2) {
                    const [first, second] = existing

                    // increases performance 5x
                    store[property] = (...args: any[]) => {
                        first(...args)
                        second(...args)
                    }

                    // do it only once when there are 3 handlers
                } else if (existing.length === 3) {
                    store[property] = function (...args: any[]) {
                        for (const handler of existing) {
                            handler(...args)
                        }
                    }
                }
            } else {
                systems.set(property, [method])

                // increases performance 10x
                store[property] = method
            }
        }
    }

    const store: any = { add }
    return store
}
