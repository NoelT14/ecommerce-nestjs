<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">E-Commerce REST API built with NestJS, PostgreSQL, and TypeORM.</p>

---

# E-Commerce NestJS — Tech Stack

## Backend Framework: NestJS v11
A progressive Node.js framework built with TypeScript. Uses a modular architecture where each feature (auth, user, address, wishlist, recently-viewed) lives in its own module with controllers, services, and entities.

**Key NestJS concepts used:**
- `@Module` — organizes code into feature modules
- `@Controller` / `@Get` / `@Post` — define REST API routes
- `@Injectable` / Services — business logic layer
- Guards (`JwtAuthGuard`, `JwtRefreshGuard`) — protect routes
- DTOs with `class-validator` — validate incoming request bodies
- Custom decorators (`@CurrentUser`) — extract data from requests

---

## Database: PostgreSQL
A relational SQL database. Default connection config:

| Config | Default Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Username | `postgres` |
| Password | `postgres` |
| Database | `ecommerce` |

Set via environment variables: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`

---

## ORM: TypeORM v0.3
Maps TypeScript classes to database tables. Configured in `src/app.module.ts`.

**Key concepts:**
- `@Entity()` — marks a class as a DB table
- `@Column()`, `@PrimaryGeneratedColumn()` — define columns
- `Repository<Entity>` — used in services to query the DB
- `synchronize: true` (non-production) — auto-syncs entity changes to the DB schema (no migrations needed in dev)

---

## Authentication: JWT + Passport
- `@nestjs/jwt` + `passport-jwt` — issues and validates JSON Web Tokens
- Access token + Refresh token pattern
- `bcrypt` — hashes passwords before storing
- Email verification and password reset flows via `nodemailer`

**Auth endpoints (`/auth`):**

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login, get tokens |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/refresh` | Get new access token |
| GET | `/auth/verify-email` | Verify email via token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/guest-token` | Get guest JWT |

---

## Config: @nestjs/config
Reads `.env` file at startup. `ConfigModule.forRoot({ isGlobal: true })` makes env vars available across all modules.

**Required `.env` variables:**
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce
JWT_SECRET=...
JWT_REFRESH_SECRET=...
NODE_ENV=development
MAIL_HOST=...
MAIL_USER=...
MAIL_PASS=...
```

---

## API Testing: Postman
Use Postman to test the REST API.

**Setup tips:**
1. Set base URL as a variable: `{{baseUrl}} = http://localhost:3000`
2. After login, save the `accessToken` to a collection variable
3. Add an Authorization header: `Bearer {{accessToken}}` on protected routes
4. Use the `/auth/refresh` endpoint to get a new token when expired


## Project Setup

```bash
# Install dependencies
npm install
```

## Compile and Run

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Run Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
