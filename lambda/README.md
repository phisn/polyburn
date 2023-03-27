# Concept
- `setup.tf` for state backend setup. run manually
- `main.tf` for general cloud environment. run automatically by github actions

## Environment
Generally the idea is that we have a API gateway accepting websocket and http requests. Than a cognito service for authentication and lambda for the backend. Additionally we need some storage maybe dynamodb.
