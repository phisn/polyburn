# Information

Server is currently split into two parts. Cloudflare Durable Object and and normal Cloudflare Worker. The durable object is used to implement very very naive multiplayer.

# Configuration

Before running it is important to create a .dev.vars file. It should contain at least:

```
CLIENT_URL = http://localhost:3000
API_URL = http://localhost:3000
```

## Authentication

If authentication is needed it should also contain:

```
AUTH_DISCORD_CLIENT_ID=
AUTH_GOOGLE_CLIENT_ID=
AUTH_GOOGLE_CLIENT_SECRET=

JWT_SECRET=unimportant_random_password_for_dev
```
