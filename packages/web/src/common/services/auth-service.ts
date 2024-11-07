import { UserDTO } from "shared/src/server/user"
import { useGlobalStore } from "../store"
import { replayService } from "./replay-service"
import { rpc } from "./rpc"
import { worldService } from "./world-service"

interface LocalStorageAuthObject {
    jwt: string
    userDTO: UserDTO
}

interface AuthServiceStateStartup {
    type: "fetching"
    jwt: string
}

interface AuthServiceStateUnauthenticated {
    type: "unauthenticated"
}

interface AuthServiceStateAuthenticated {
    type: "authenticated"

    jwt: string
    userDTO: UserDTO
}

interface AuthServiceStateOffline {
    type: "offline"

    jwt: string
    userDTO: UserDTO
}

type AuthServiceState =
    | AuthServiceStateStartup
    | AuthServiceStateUnauthenticated
    | AuthServiceStateAuthenticated
    | AuthServiceStateOffline

class AuthService {
    private state: AuthServiceState

    constructor() {
        const authObjectStr = localStorage.getItem("auth")

        if (authObjectStr) {
            const authObject = JSON.parse(authObjectStr) as LocalStorageAuthObject

            if (navigator.onLine) {
                this.state = {
                    type: "fetching",

                    jwt: authObject.jwt,
                }

                this.fetchUserInfo()
            } else {
                this.state = {
                    type: "offline",

                    jwt: authObject.jwt,
                    userDTO: authObject.userDTO,
                }

                useGlobalStore.getState().setCurrentUser(this.state.userDTO)
            }
        } else {
            this.state = {
                type: "unauthenticated",
            }
        }

        window.addEventListener("online", () => {
            if (this.state.type === "offline") {
                this.fetchUserInfo()
            }
        })
    }

    getJwt() {
        return "jwt" in this.state ? this.state.jwt : undefined
    }

    getState() {
        return this.state.type
    }

    logout() {
        localStorage.removeItem("auth")

        this.state = {
            type: "unauthenticated",
        }

        useGlobalStore.getState().setCurrentUser()
    }

    async login(jwt: string) {
        if (this.state.type !== "unauthenticated") {
            throw new Error("Tried to login in invalid state")
        }

        this.state = {
            type: "fetching",
            jwt,
        }

        await this.fetchUserInfo()
    }

    private async fetchUserInfo() {
        if (this.state.type !== "fetching") {
            throw new Error("No JWT found")
        }

        const response = await rpc.user.me.$get()

        if (!response.ok) {
            throw new Error("Failed to fetch user info")
        }

        const responseJson = await response.json()

        this.state = {
            type: "authenticated",

            jwt: this.state.jwt,
            userDTO: responseJson.user,
        }

        localStorage.setItem(
            "auth",
            JSON.stringify({
                jwt: this.state.jwt,
                userDTO: this.state.userDTO,
            } satisfies LocalStorageAuthObject),
        )

        useGlobalStore.getState().setCurrentUser(responseJson.user)

        await Promise.all([replayService.sync(), worldService.sync()])
    }
}

export const authService = new AuthService()
