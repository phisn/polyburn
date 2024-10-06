import { TRPCError } from "@trpc/server"
import jwt from "@tsndr/cloudflare-worker-jwt"
import { eq } from "drizzle-orm"
import { OAuth2RequestError } from "oslo/oauth2"
import { z } from "zod"
import { JwtCreationToken } from "../../domain/auth/jwt-creation-token"
import { JwtToken } from "../../domain/auth/jwt-token"
import { logs, users } from "../framework/db-schema"
import { publicProcedure, router } from "../framework/trpc"

export const userRouter = router({
    me: publicProcedure.query(async ({ ctx: { db, user } }) => {
        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Not logged in",
            })
        }

        const [dbUser] = await db.select().from(users).where(eq(users.id, user.id))

        if (!dbUser) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "User not found",
            })
        }

        await db.insert(logs).values({
            userid: user.id,
            time: Date.now(),
        })

        return { username: dbUser.username }
    }),
    rename: publicProcedure
        .input(
            z
                .object({
                    username: z.string(),
                })
                .required(),
        )
        .mutation(async ({ input: { username }, ctx: { db, user } }) => {
            if (!user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not logged in",
                })
            }

            const duplicate = await db.select().from(users).where(eq(users.username, username))

            if (duplicate.length > 0) {
                return {
                    message: "username-taken" as const,
                }
            }

            await db.update(users).set({ username }).where(eq(users.id, user.id))
            console.log("renamed user", user.id, "to", username)

            return { message: "success" as const }
        }),
    getToken: publicProcedure
        .input(
            z
                .object({
                    code: z.string(),
                })
                .required(),
        )
        .query(async ({ input: { code }, ctx: { oauth, env, db } }) => {
            try {
                const { access_token } = await oauth.validateAuthorizationCode(code, {
                    credentials: env.AUTH_GOOGLE_CLIENT_SECRET,
                    authenticateWith: "request_body",
                })

                const userInfoRequest = await fetch(
                    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
                )

                if (!userInfoRequest.ok) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to fetch user info",
                    })
                }

                const userInfo = z
                    .object({
                        email: z.string(),
                    })
                    .safeParse(await userInfoRequest.json())

                if (userInfo.success === false) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to parse user info",
                    })
                }

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, userInfo.data.email))

                if (!user) {
                    const tokenForCreation = await jwt.sign(
                        {
                            email: userInfo.data.email,
                        },
                        env.JWT_SECRET,
                    )

                    return { tokenForCreation, type: "prompt-create" as const }
                }

                const token = await jwt.sign<JwtToken>(
                    {
                        id: user.id,
                        iat: Date.now(),
                    },
                    env.JWT_SECRET,
                )

                return { token, type: "logged-in" as const }
            } catch (e) {
                console.error(e)
                if (e instanceof OAuth2RequestError) {
                    console.error(e)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: e.message,
                    })
                }

                throw e
            }
        }),
    create: publicProcedure
        .input(
            z
                .object({
                    tokenForCreation: z.string(),
                    username: z.string(),
                })
                .required(),
        )
        .mutation(async ({ input: { tokenForCreation, username }, ctx: { env, db } }) => {
            const verification = await jwt.verify(tokenForCreation, env.JWT_SECRET)

            if (verification === false) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid token",
                })
            }

            const payload = jwt.decode<JwtCreationToken>(tokenForCreation).payload

            if (!payload) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid token",
                })
            }

            const duplicate = await db.select().from(users).where(eq(users.username, username))

            if (duplicate.length > 0) {
                return {
                    message: "username-taken" as const,
                }
            }

            const { email } = payload

            const [user] = await db
                .insert(users)
                .values({
                    username: username,
                    email: email,
                })
                .returning({ id: users.id })

            if (!user) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Failed to create user",
                })
            }

            const token = await jwt.sign<JwtToken>(
                {
                    id: user.id,
                    iat: Date.now(),
                },
                env.JWT_SECRET,
            )

            return { message: "success" as const, jwt: token }
        }),
})
