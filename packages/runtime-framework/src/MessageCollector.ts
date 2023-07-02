export interface MessageCollector<Message extends object, Key extends keyof Message> {
    consume(): Message[Key][]
    free(): void
}
