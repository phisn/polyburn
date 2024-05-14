import { DurableObject } from "cloudflare:workers"
import { z } from "zod"

export class DurableObjectLobby extends DurableObject {
    async fetch(request: Request): Promise<Response> {
        const { 0: client, 1: server } = new WebSocketPair()

        // why does server not have accept when all examples use it???
        ;(server as any).accept()

        server.addEventListener("message", event => {
            const parsed = z
                .object({
                    type: z.string(),
                })
                .safeParse(event.data)

            if (parsed.success) {
                const t = parsed.data.type
            }

            return undefined
        })

        return new Response(null, {
            status: 101,
            webSocket: client,
        })
    }
}
