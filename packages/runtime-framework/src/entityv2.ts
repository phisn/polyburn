export type Module<Behaviors> = Record<string, Readonly<Behaviors>> & {
    get id(): number
    get children(): Module<Behaviors>[]
    get parent(): Module<Behaviors> | undefined
}
