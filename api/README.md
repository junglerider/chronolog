# Chronolog Backend (API)

## Project setup
```
npm install
```

### Compile Typescript project manually
```
npm run build
```

### Compile Typescript project automatically
```
npm run watch
```

### Run backend API
```
npm start | bunyan
```

### Run tests (with coverage)
```
npm test
```

## Configure trusted CORS origins

Set `CORS_ORIGINS` to a comma-separated list of exact origins, including scheme and port where applicable, with no paths or trailing slashes. When unset, non-production runs allow the Vite development origins on port 5403; production allows no cross-origin requests by default. The bundled application is served from the API's origin and does not need CORS. Set this variable when hosting the frontend on a separate origin.

## Passwords in production

Set `NODE_ENV=production` in production (the Docker image does this). Accounts with an empty password can log in with an empty password in every environment. Set passwords for such accounts before exposing the application to untrusted users.

An authenticated administrator can reset an account with `DELETE /api/user/:id/password`, then set a new non-empty password with `PUT /api/user/:id/password` using an empty `oldPassword`. This requires an active administrator session; single-admin lockout recovery remains an operator responsibility.

### Cleanup
```
npm run clean
```
