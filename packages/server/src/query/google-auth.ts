import { TRPCError } from "@trpc/server"
import jwt from "@tsndr/cloudflare-worker-jwt"
import { eq } from "drizzle-orm"
import { OAuth2RequestError } from "oslo/oauth2"
import { z } from "zod"
import { users } from "../db-schema"
import { publicProcedure, router } from "../trpc"

export const googleAuthRouter = router({
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

                    return { tokenForCreation, type: "prompt-create" }
                }

                const token = await jwt.sign(
                    {
                        username: user.username,
                    },
                    env.JWT_SECRET,
                )

                return { token, username: user.username, type: "logged-in" }
            } catch (e) {
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
        .query(async ({ input: { tokenForCreation, username }, ctx: { env, db } }) => {
            const verification = await jwt.verify(tokenForCreation, env.JWT_SECRET)

            if (verification === false) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid token",
                })
            }

            const payload = jwt.decode<{ email: string }>(tokenForCreation).payload

            if (!payload) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid token",
                })
            }

            const { email } = payload

            const token = await jwt.sign(
                {
                    username,
                },
                env.JWT_SECRET,
            )

            await db.insert(users).values({
                username: username,
                email: email,
            })

            return { token }
        }),
})
