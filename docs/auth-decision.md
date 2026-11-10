# Veneha Authentication & Data Layer Architecture Decision

## 1. Workspace & GateIQ Inspection
- Checked workspace and parent directories for the owner's GateIQ codebase. GateIQ source code is not present in the local workspace.
- Inspected Veneha's existing storage: prior attempts and guest profiles were stored in client-side `localStorage` (`ssb_prep_attempts`, `ssb_prep_guest`, `ssb_prep_daily_usage`, `ssb_prep_wat_attempts`).

## 2. Chosen Architecture

### Database: Embedded SQLite (`better-sqlite3`)
- **Location:** Local file at `data/veneha.db` (git-ignored, auto-migrated on startup).
- **Rationale:** 
  - Zero external database server dependencies, works reliably out-of-the-box in local development and containerized environments.
  - Full ACID transaction support (required for atomic guest-history claiming).
  - High read/write throughput for user accounts, sessions, rate-limiting, and attempt records.

### Cryptography & Password Hashing
- **Library:** `bcryptjs` (12 salt rounds).
- **Security:** One-way salted hash. Plaintext passwords are never logged, stored, or returned.

### Session Management
- **Library:** `jose` (JSON Web Token signing with `HS256`).
- **Transport:** `HttpOnly`, `Secure` (in production), `SameSite=Lax`, path `/` cookie named `veneha_session`.
- **Secret:** `AUTH_SECRET` read from `.env.local` (with fallback warning for development).
- **Expiration:** 30 days rolling. Sign-out clears cookie immediately.

### Unified Identity & Owner Model
A server helper `getAuthOwner(req)` derives the current owner directly from server cookies:
- Returns `{ type: 'user', userId: string, user: UserProfile }` for signed-in accounts.
- Returns `{ type: 'guest', guestId: string }` for active guest sessions (`veneha_guest` cookie or header).
- Returns `{ type: 'anonymous' }` if neither is present.

### Server-Side Authorization
All attempt-related API endpoints derive ownership strictly from the server session, preventing ID spoofing or cross-user data leakage.

### Rate Limiting & Abuse Prevention
- Max 5 failed sign-in attempts per 15 minutes per email and IP address.
- Generic failure messages ("Email or password is incorrect") to prevent user enumeration.
- Account creation requires age confirmation (`age_confirmed_18_plus = true`) and agreement to the Privacy note.

