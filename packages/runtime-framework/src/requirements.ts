export const ModifierNot = "not-"

// => keyof Components & "not-" + keyof Components
export type ComponentsWithModifier<Components extends object> =
    | keyof Components
    | `${typeof ModifierNot}${keyof Components & string}`

// filter the result of ComponentsWithModifier so that it is keyof Components
export type FilterModifier<
    C extends string | number | symbol,
    Components extends object,
> = C extends keyof Components ? C : never

export function requirementsSatisfyComponents(
    requirements: readonly string[],
    components: readonly string[],
) {
    for (const requirement of requirements) {
        if (requirement.startsWith(ModifierNot)) {
            const forbidden = requirement.slice(ModifierNot.length)

            if (components.includes(forbidden)) {
                return false
            }

            continue
        }

        if (components.includes(requirement) === false) {
            return false
        }
    }

    return true
}
