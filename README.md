# Role-Based Authentication API

A role-based music API built with Node.js, Express, MongoDB, JWT, and ImageKit. The API supports two roles:

- `artist`: uploads music and creates albums.
- `user`: browses music and albums.

Authentication is handled with JWTs. Successful registration and login return a token in the JSON response and set the same token in an HTTP cookie. Protected endpoints also accept a bearer token in the `Authorization` header.

## Features

- User registration and login with bcrypt password hashing
- Role-based authorization for artists and users
- JWT authentication through cookies or bearer tokens
- Music uploads through Multer and ImageKit
- Album creation and retrieval
- MongoDB persistence with Mongoose
- Postman assets for API testing

## Tech Stack

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs`
- Multer (in-memory upload handling)
- ImageKit

## Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database or MongoDB Atlas cluster
- An ImageKit account and private key

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/roleBasedAuthentication
JWT_SECRET=replace-with-a-long-random-secret
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
```

Do not commit `.env` or share its contents. Use a different secret for every environment. If credentials have ever been committed or shared, rotate them before deploying.

### 3. Start the development server

```bash
npm run dev
```

The server listens on `http://localhost:3000`.

> The project currently provides a development script only. The `npm test` script is a placeholder and exits with an error until tests are added.

## Authentication Model

Every protected request must authenticate with either:

```http
Cookie: token=<jwt>
```

or:

```http
Authorization: Bearer <jwt>
```

The API currently authorizes roles exclusively:

| Endpoint group | Required role |
| --- | --- |
| `POST /api/music/upload` | `artist` |
| `POST /api/music/album` | `artist` |
| `GET /api/music` | `user` |
| `GET /api/music/album` | `user` |
| `GET /api/music/album/:albumId` | `user` |

Registration defaults to `user`. To create an artist account, send `"role": "artist"` in the registration body.

## API Reference

All request and response bodies are JSON except the music upload endpoint, which uses `multipart/form-data`.

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "demo-artist",
  "email": "artist@example.com",
  "password": "strong-password",
  "role": "artist"
}
```

`role` is optional and defaults to `user`. A successful request returns `201 Created`.

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "demo-artist",
  "password": "strong-password"
}
```

Use either `username` or `email` with `password`. A successful request returns `200 OK` and sets the `token` cookie.

### Logout

```http
POST /api/auth/logout
```

Clears the `token` cookie and returns `200 OK`.

### Upload music

Artist-only endpoint:

```http
POST /api/music/upload
Authorization: Bearer <artist-token>
Content-Type: multipart/form-data
```

Form fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | text | Yes | Track title |
| `music` | file | Yes | Audio file uploaded to ImageKit |

Returns `201 Created` with the saved track ID, title, artist ID, and hosted file URL.

### Create an album

Artist-only endpoint:

```http
POST /api/music/album
Authorization: Bearer <artist-token>
Content-Type: application/json
```

```json
{
  "title": "Demo Album",
  "music": [
    "665f1c3c2a3e8f0012345678",
    "665f1c3c2a3e8f0098765432"
  ]
}
```

`music` is an array of existing music document IDs. Returns `201 Created`.

### List music

User-only endpoint:

```http
GET /api/music
Authorization: Bearer <user-token>
```

Returns up to two music documents, including populated artist information.

### List albums

User-only endpoint:

```http
GET /api/music/album
Authorization: Bearer <user-token>
```

Returns albums with their tracks populated and artist username/email included.

### Get an album

User-only endpoint:

```http
GET /api/music/album/<albumId>
Authorization: Bearer <user-token>
```

Returns one album with populated tracks and artist information.

## Common Responses

| Status | Meaning |
| --- | --- |
| `200` | Request completed successfully |
| `201` | Resource created successfully |
| `401` | Missing, invalid, or expired authentication |
| `403` | Authenticated user has the wrong role |
| `409` | Username or email already exists |

## Example Flow

Using two accounts makes the role separation explicit:

1. Register an artist with `"role": "artist"`.
2. Log in as the artist and keep the returned token.
3. Upload one or more tracks with `POST /api/music/upload`.
4. Create an album using the returned track IDs.
5. Register a normal user or log in as one.
6. Use the user token to call the music and album read endpoints.

With `curl`, a login request looks like this:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artist@example.com","password":"strong-password"}'
```

For bearer-token clients, use the token from the response:

```bash
curl http://localhost:3000/api/music \
  -H "Authorization: Bearer <user-token>"
```

## Project Structure

```text
.
├── server.js                    # Application entry point
├── src/
│   ├── app.js                   # Express application and route mounting
│   ├── controllers/             # Authentication and music handlers
│   ├── db/                      # MongoDB connection
│   ├── middlewares/             # JWT and role authorization
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # API route definitions
│   └── services/                # ImageKit storage integration
├── postman/                     # Postman collections and supporting files
├── package.json
└── .env                         # Local secrets; do not commit
```

## Development Notes

- The server connects to MongoDB on startup and listens on port `3000`.
- Uploaded files are held in memory by Multer before being sent to ImageKit.
- ImageKit files are stored under `yt-complete-backend/music`.
- JWTs currently do not specify an expiration time. Add an expiration policy before production use.
- For production, configure secure cookie options such as `httpOnly`, `secure`, and an appropriate `sameSite` policy.
- Validate upload type and size, request fields, ObjectId values, and service errors before exposing this API publicly.
- Avoid returning password hashes in authentication responses; return a safe user projection instead.

## Testing With Postman

The repository includes Postman-related files under `postman/`. Import the available collection and environment files into Postman, set the local API base URL to `http://localhost:3000`, and run the requests in the authentication-to-music flow described above.

## License

This project currently uses the ISC license as declared in `package.json`.