export class EventStore<Events extends object> {
    private listeners: {
        [K in keyof Events]?: Events[K][]
    } = {}

    constructor() {
        this.invoke = {}
    }

    listen(events: Partial<Events>): () => void {
        const keys = Object.keys(events) as (keyof Events)[]

        for (const key of keys) {
            if (!this.listeners[key]) {
                this.listeners[key] = []

                const invoker = (...args: any[]) => {
                    for (const listener of this.listeners[key] as any[]) {
                        listener(...args)
                    }
                }

                this.invoke[key] = invoker as Events[keyof Events]
            }

            if (events[key]) {
                this.listeners[key]?.push(events[key])
            }
        }

        return () => {
            for (const key of keys) {
                this.listeners[key] = this.listeners[key]?.filter(
                    listener => listener !== events[key],
                )
            }
        }
    }

    public invoke: Partial<Events> = {}
}
