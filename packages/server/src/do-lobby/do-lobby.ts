import { DurableObject } from "cloudflare:workers"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import {
    UpdateFromClient,
    UpdateFromServer,
    updateFromClient,
} from "shared/src/websocket-api/lobby-api"
import { Env } from "../worker/env"
import { users } from "../worker/framework/db-schema"
import { userFromAuthorizationHeader } from "../worker/framework/helper/user-from-authorization-header"
import { UserPositionTracker } from "./user-positions-tracker"

interface WebsocketClientContext {
    userId: number
    username: string
}

export class DurableObjectLobby extends DurableObject {
    private db: ReturnType<typeof drizzle>

    private positionsTracker: UserPositionTracker
    private connections: Set<WebSocket> = new Set()

    private usersJoined: { username: string }[]
    private userLeft: { username: string }[]

    constructor(state: DurableObjectState, env: Env) {
        super(state, env)

        this.db = drizzle(env.DB)
        this.positionsTracker = new UserPositionTracker()

        this.usersJoined = []
        this.userLeft = []

        setInterval(() => {
            const message: UpdateFromServer = {
                type: "serverUpdate",
                positionPackets: this.positionsTracker.retrievePackets(),
                usersConnected: this.usersJoined,
                usersDisconnected: this.userLeft,
            }

            const messageString = JSON.stringify(message)

            for (const connection of this.connections) {
                connection.send(messageString)
            }
        }, 1000)
    }

    async fetch(request: Request): Promise<Response> {
        const { 0: client, 1: server } = new WebSocketPair()

        const context = await this.contextFromRequest(request)

        if (!context) {
            console.warn("Failed to load context for user")
            return new Response(null, {
                status: 401,
            })
        }

        // why does server not have accept when all examples use it???
        ;(server as any).accept()

        this.connections.add(server)
        this.usersJoined.push({ username: context.username })

        console.log(`Client ${context.username} connected (${this.connections.size} total)`)

        server.addEventListener("message", event => {
            const message = updateFromClient.safeParse(JSON.parse(event.data))

            if (message.success === false) {
                server.close(1008, "Invalid message")
                return
            }

            switch (message.data.type) {
                case "clientUpdate":
                    this.onClientUpdate(message.data, context)
                    break
            }

            return undefined
        })

        server.addEventListener("close", () => {
            this.connections.delete(client)
            this.userLeft.push({ username: context.username })

            console.log(
                `Client ${context.username} disconnected (${this.connections.size} remaining)`,
            )
        })

        return new Response(null, {
            status: 101,
            webSocket: client,
        })
    }

    private async contextFromRequest(
        request: Request,
    ): Promise<WebsocketClientContext | undefined> {
        const user = userFromAuthorizationHeader(
            this.env as Env,
            new URL(request.url).searchParams.get("authorization"),
        )

        if (!user) {
            console.log("No user")
            return undefined
        }

        const [dbUser] = await this.db.select().from(users).where(eq(users.id, user.id))

        if (!dbUser) {
            console.log("No db user")
            return undefined
        }

        return {
            userId: user.id,
            username: dbUser.username,
        }
    }

    private onClientUpdate(message: UpdateFromClient, context: WebsocketClientContext) {
        this.positionsTracker.addPositions(context.username, message.positions)
    }
}
