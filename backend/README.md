## How to use

### 1. Clone this repo & install dependencies
`npm install`

### 2. Create Table schema
`npm run db:generate`

### 3. push schema to database
`npm run db:push`

### 4. create admin user for development
```
npm run db:db:init_data_devel
```
or for release version
```
npm run db:db:init_data
```

### 4. Start the Fastify server
Running development server is pretty straightforward. It uses just Node.js with the latest TypeScript configuration support. You need Node v23.x, check `tsconfig.json` for details. Just run the following command in watch mode:
```
npm dev
```

### 5. Building 🚀
To generate a production build, the project uses [tsup](https://github.com/egoist/tsup). Build server with command:
```
npm build
```


## API Documentation
### better-authentication-api
1. */auth/sign-in* – [POST] - Sign in via email, password, social providers, or passkey (WebAuthn)
2. */auth/sign-up* – [POST] - New account registration, with additional fields supported
3. */auth/request-password-reset* – [POST] (email, redirectTo) - Trigger password reset email
4. */auth/reset-password* – [POST] (newPassword, token) - Allow users to reset forgotten passwords
5. */auth/sign-out* – [POST] - Log out action
6. */auth/get-session* – [GET] - Get current session information (authentication required)

note:
- *sign-in* and *sign-up* : add ...api_path/*email* when the user try to call api from emailAndPassword login method.

how to process reset password flow?
1. send request to /request-password-reset endpoint.
2. get token from email link.
3. call /reset-password endpoint with new password and token.
