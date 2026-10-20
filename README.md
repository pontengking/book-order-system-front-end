# Bookkeeper

React application for book management, built with hooks and Material UI. Includes paginated title search, creation, editing, stock adjustment, and removal only at zero stock. No order features.

## Run locally

Requires Node.js 22.12+ and the backend at http://localhost:8080.

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

The Vite server proxies `/api` to the backend and supplies HTTP Basic authentication using the provided local credentials (`book` / `book`). Credentials are not included in the browser bundle. To override local settings, create `.env.local` using `.env.example`.

## API integration

- `POST /books/search`: paginated listing and title search.
- `POST /books/save`: create a book.
- `PUT /books/{id}`: edit details or stock.
- `DELETE /books/{id}`: remove a zero-stock book.

The client unwraps the backend's `{ status, errorDesc, data }` responses and handles both HTTP errors and `FAIL` responses. Prices have a minimum of 0.01; quantity is a nonnegative 32-bit integer. Failed saves keep the form open.

## Verification

```sh
npm run lint
npm run build
npm run test:e2e
```

The Playwright test uses installed Google Chrome and the live backend. It creates a uniquely named temporary book, verifies create/edit, search, persistence, stock controls, validation, removal, and mobile layout, then cleans up its own record. Screenshots are written to `test-results/`.

## Deployment

`npm run build` creates `dist/`. `npm run preview` serves it with the same local API proxy for verification. A production host must provide an equivalent server-side `/api` proxy and authentication; Vite's proxy is not part of the static build. Override `VITE_API_BASE_URL` only when an alternative server endpoint is configured to handle authentication and CORS. Never put API passwords in `VITE_` variables.
