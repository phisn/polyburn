
export type MessageCollector<Message> = Iterable<Message>

/*
export interface MessageCollector<Message extends object, Key extends keyof Message> {
    consume(): Message[Key][]
}
*/
