import { Mutation } from "../runtime-context/mutation"

export interface GroupComponent {
    group(): string
    mutation(group: string): Mutation
}
