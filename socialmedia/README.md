# Insecure Social Media Training App

**WARNING: This application is intentionally vulnerable. Never expose it to the internet or use real data. Run only inside an isolated lab environment.**

This project provides a deliberately insecure social media platform for hands-on security training. It uses a MySQL backend, Node.js API, and vanilla JavaScript frontend. Each major screen showcases a classic web vulnerability.

## Quick Start

### Docker Compose

1. Build and launch the stack:
   ```bash
   docker compose up --build
   ```
2. Visit the frontend at `http://localhost:8080`.
3. Backend API is at `http://localhost:3000`.
4. Adminer database console is at `http://localhost:8081` (host `mysql`, user `root`, password `root`).

### Local scripts

- Backend (from `backend/`):
  ```bash
  npm install
  npm run dev
  ```
- Frontend (from `frontend/`):
  ```bash
  npm install
  npm start
  ```

## Default Credentials

- Admin: `admin@example.com` / `user123`
- User: `user@example.com` / `user123`
- All other seeded accounts also use `user123` as the password.

## Seed Data

The MySQL seed creates tables for users, posts, friends, messages, photos, and notifications, and populates sample content for demonstrations. Over two dozen extra user records are inserted so the friends feature has a large dataset (only `user@example.com` has active friendships). No photos are seeded by default—publish your own via the Photos page. Run via Docker init volume or manually with `backend/src/seed/seed.sql`.

## Vulnerability Guide

| Screen | Endpoint(s) | Vulnerability | How to Reproduce |
| --- | --- | --- | --- |
| Profile | `GET /api/users/:id` | Insecure Direct Object Reference | Log in and call the profile API manually (e.g., `fetch('/api/users/1')`) to retrieve any account without authorization checks. |
| Friends | `POST /api/friends/add`, `GET /api/friends` | Stored XSS | Log in as `user@example.com`, open the browser console, and run `fetch('/api/friends/add', {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({friendId:3,nickname:"<img src=x onerror=alert('xss')>"})})`, then refresh the Friends view to trigger the payload. |
| Messages | `POST /api/messages/send` | CSRF | Submit the form or craft a cross-site POST (no token or same-site checks) to send messages from the victim. |
| Search | `GET /api/search` | SQL Injection + XSS sink | Search for `' OR 1=1 --` to dump all users. Returned HTML renders unsanitized. |
| Timeline | `POST /api/posts`, `GET /api/posts/feed` | Stored HTML in posts | Publish a post containing `<img src=x onerror=alert(1)>` and it will render for every friend. |
| Photos | `GET /api/photos/:filename` | Path Traversal | Request `../../../../etc/passwd` (if present) or other paths to read arbitrary files within the container. |
| Settings | `POST /api/settings/update` | Mass Assignment | Craft a request such as `fetch('/api/settings/update', {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({ blocked: 1 })})` to toggle hidden fields the UI never exposes. |
| Notifications | `GET /api/notifications` | Open Redirect | Append `&next=https://example.com` to the URL (or login request) to force a redirect after login. |

Additionally, the backend includes a trivial IP-based rate limiter that is easy to bypass and plaintext passwords for convenience.

## Safety Notes

- Intended solely for controlled lab environments.
- Do not reuse credentials anywhere else.
- Reset the Docker volumes (`docker compose down -v`) to restore a clean state.
