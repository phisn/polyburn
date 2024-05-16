import { DurableObject } from "cloudflare:workers"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { randomUUID } from "node:crypto"
import {
    InitializeFromServer,
    OtherUser,
    UpdateFromClient,
    UpdateFromServer,
    updateFromClient,
} from "shared/src/websocket-api/lobby-api"
import { Env } from "../worker/env"
import { users } from "../worker/framework/db-schema"
import { userFromAuthorizationHeader as userFromRequest } from "../worker/framework/helper/user-from-authorization-header"
import { UserFrameTracker } from "./user-frame-tracker"

interface WebsocketClientContext {
    lobbyName: string

    userId: number
    username: string
}

interface ConnectedUser {
    user: OtherUser
    connection: WebSocket
}

class SingleLobby {
    private frameTracker: UserFrameTracker
    private currentlyPlaying: Map<string, ConnectedUser> = new Map()

    private usersJoined: OtherUser[]
    private userLeft: OtherUser[]

    private interval: ReturnType<typeof setInterval>

    constructor() {
        this.frameTracker = new UserFrameTracker()

        this.usersJoined = []
        this.userLeft = []

        this.interval = setInterval(() => {
            const message: UpdateFromServer = {
                type: "update",
                framePackets: this.frameTracker.retrievePackets(),
                usersConnected: this.usersJoined,
                usersDisconnected: this.userLeft,
            }

            const messageString = JSON.stringify(message)

            for (const { connection } of this.currentlyPlaying.values()) {
                connection.send(messageString)
            }

            this.usersJoined = []
            this.userLeft = []
        }, 400)
    }

    dispose() {
        clearInterval(this.interval)
    }

    addUser(connectedUser: ConnectedUser) {
        this.currentlyPlaying.set(connectedUser.user.username, connectedUser)
        this.usersJoined.push(connectedUser.user)

        const initializeMessage: InitializeFromServer = {
            type: "initialize",
            users: [...this.currentlyPlaying.values()].map(({ user }) => user),
        }

        connectedUser.connection.send(JSON.stringify(initializeMessage))

        console.log(
            `Client ${connectedUser.user.username} connected (${this.currentlyPlaying.size} total)`,
        )
    }

    removeUser(username: string) {
        const user = this.currentlyPlaying.get(username)

        if (!user) {
            return
        }

        this.currentlyPlaying.delete(username)
        this.userLeft.push(user.user)

        console.log(
            `Client ${user.user.username} disconnected (${this.currentlyPlaying.size} remaining)`,
        )
    }

    onClientUpdate(message: UpdateFromClient, context: WebsocketClientContext) {
        const success = this.frameTracker.trackPacket({
            frames: message.frames,
            username: context.username,
        })

        if (!success) {
            const client = this.currentlyPlaying.get(context.username)
            client?.connection.close(1008, "Invalid packet")
        }
    }

    get userCount() {
        return this.currentlyPlaying.size
    }
}

interface UserInLobbiesTracker {
    connection: WebSocket
    connectionId: string

    lobbyName: string
}

export class DurableObjectLobby extends DurableObject {
    private db: ReturnType<typeof drizzle>

    private connections: Map<string, UserInLobbiesTracker> = new Map()
    private lobbies: Map<string, SingleLobby> = new Map()

    constructor(state: DurableObjectState, env: Env) {
        super(state, env)
        this.db = drizzle(env.DB)
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

        const connectionId = randomUUID()

        // why does server not have accept when all examples use it???
        ;(server as any).accept()

        const existingConnection = this.connections.get(context.username)

        if (existingConnection) {
            this.removeUser(context.username)
        }

        this.connections.set(context.username, {
            connection: server,
            connectionId,
            lobbyName: context.lobbyName,
        })

        let lobby = this.lobbies.get(context.lobbyName)

        if (!lobby) {
            lobby = new SingleLobby()
            this.lobbies.set(context.lobbyName, lobby)
        }

        lobby.addUser({
            user: {
                username: context.username,
            },
            connection: server,
        })

        server.addEventListener("message", event => {
            const message = updateFromClient.safeParse(JSON.parse(event.data))

            if (message.success === false) {
                server.close(1008, "Invalid message")
                return
            }

            switch (message.data.type) {
                case "update": {
                    lobby.onClientUpdate(message.data, context)

                    break
                }
            }

            return undefined
        })

        server.addEventListener("close", () => {
            const connection = this.connections.get(context.username)

            // check if connection has been overwritten
            if (connection?.connectionId !== connectionId) {
                return
            }

            this.removeUser(context.username)
        })

        return new Response(null, {
            status: 101,
            webSocket: client,
        })
    }

    private removeUser(username: string) {
        const connection = this.connections.get(username)

        if (!connection) {
            return
        }

        connection.connection.close(1008, "Connection closed")

        this.connections.delete(username)

        const lobby = this.lobbies.get(connection.lobbyName)

        if (!lobby) {
            return
        }

        lobby.removeUser(username)

        if (lobby.userCount === 0) {
            lobby.dispose()
            this.lobbies.delete(connection.lobbyName)
        }
    }

    private async contextFromRequest(
        request: Request,
    ): Promise<WebsocketClientContext | undefined> {
        const user = userFromRequest(
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

        const lobbyName = new URL(request.url).searchParams.get("id")

        if (!lobbyName) {
            console.log("No lobby")
            return undefined
        }

        return {
            lobbyName,

            userId: user.id,
            username: dbUser.username,
        }
    }
}
