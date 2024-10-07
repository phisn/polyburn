import { zValidator } from "@hono/zod-validator"
import jwt from "@tsndr/cloudflare-worker-jwt"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { OAuth2Client } from "oslo/oauth2"
import { z } from "zod"
import { Environment } from "../../env"
import { JwtToken, userDTO, users } from "./user-model"
import { UserService } from "./user-service"

export const routeUser = new Hono<Environment>()
    .get(
        "/me",
        zValidator(
            "query",
            z.object({
                clock: z.number(),
            }),
        ),
        async c => {
            const userService = new UserService(c)
            const user = await userService.getAuthenticated()

            if (user === undefined) {
                return c.status(401)
            }

            return c.json({
                user: userDTO(user),
            })
        },
    )
    .post(
        "/signin",
        zValidator(
            "json",
            z.object({
                code: z.string(),
            }),
        ),
        async c => {
            const db = c.get("db")
            const json = c.req.valid("json")

            const client = new OAuth2Client(
                c.env.ENV_GOOGLE_ID,
                "https://accounts.google.com/o/oauth2/auth",
                "https://accounts.google.com/o/oauth2/token",
                {
                    redirectURI: c.env.ENV_URL_CLIENT.split(",").at(0),
                },
            )

            let userInfoRequest

            try {
                const { access_token } = await client.validateAuthorizationCode(json.code, {
                    credentials: c.env.ENV_GOOGLE_SECRET,
                    authenticateWith: "request_body",
                })

                userInfoRequest = await fetch(
                    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
                )
            } catch (e) {
                console.error(e)
                throw new HTTPException(401)
            }

            if (userInfoRequest.ok === false) {
                throw new HTTPException(401)
            }

            const userInfo = z
                .object({
                    email: z.string(),
                })
                .safeParse(await userInfoRequest.json())

            if (userInfo.success === false) {
                throw new HTTPException(401)
            }

            const [user] = await db.select().from(users).where(eq(users.email, userInfo.data.email))

            if (user === undefined) {
                return c.json({
                    token: await jwt.sign<JwtToken>(
                        {
                            iat: Date.now(),
                            type: "signup",
                            email: userInfo.data.email,
                        },
                        c.env.ENV_JWT_SECRET,
                    ),
                    type: "create",
                })
            } else {
                return c.json({
                    token: await jwt.sign<JwtToken>(
                        {
                            iat: Date.now(),
                            type: "login",
                            userId: user.id,
                        },
                        c.env.ENV_JWT_SECRET,
                    ),
                    type: "login",
                })
            }
        },
    )
    .post(
        "/signup",
        zValidator(
            "json",
            z.object({
                username: z.string(),
            }),
        ),
        async c => {
            const jwtToken = c.get("jwtToken")

            if (jwtToken?.type !== "signup") {
                return c.status(401)
            }

            const db = c.get("db")
            const json = c.req.valid("json")

            const user = {
                email: jwtToken.email,
                username: json.username,
            } as const

            const [response] = await db
                .insert(users)
                .values(user)
                .returning({
                    id: users.id,
                })
                .onConflictDoNothing()

            if (response === undefined) {
                return c.json(
                    {
                        reason: "name-taken",
                    },
                    400,
                )
            }

            return c.json({
                currentUser: userDTO({
                    ...response,
                    ...user,
                }),
            })
        },
    )
