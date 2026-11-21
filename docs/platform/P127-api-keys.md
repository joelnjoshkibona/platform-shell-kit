# P127 · API keys: a person's key for another program

Status: **decided** (kit 1.46.0). Owner 2026-11-21, for the project generator's external API (step 8 round 3): a
program (a script, a CI job, another system) calls a product's API without a person signing in.

## Decision

### 1. A key is a person's, in one organisation

- A person makes a key for themselves, in the organisation they are working in. The key acts as that person, and
  only in that organisation: the `X-Organization` header is ignored for a key; its organisation is the key's.
- What a key may do is the **scopes** chosen when it is made: permission names (`Projects.list`, `Projects.build`)
  the person holds. A call needs both: the key's scope and the person's permission, checked on every call. A person
  who loses a permission, or is deactivated, loses it for their keys too (deactivation deletes their keys).
- A key is shown **once**, when it is made, with Copy. It is stored only as a hash and can never be shown again; a
  lost key is revoked and a new one made. It starts with a prefix that names it (`bbk_` and 8 characters), kept to
  tell keys apart in lists and logs.
- A key may have an expiry date. Revoking deletes it; an expired or revoked key is refused (`401`).

### 2. Only routes opened to keys accept them

A module opens a route to keys explicitly (Bootbox: the `apikey` route middleware). Any other route answers a key with
`403` ("this route is not open to API keys"), whatever its scopes: a key never reaches drafts, pickers (`/select`),
sign-in, the person's settings or another person's data. The scopes a key can be given are the permissions of the
routes opened to keys that the person holds.

### 3. Limits and a record of use

- Each key has its own limit of requests a minute (60 by default, set when it is made); over it, `429` with
  `Retry-After`.
- Every call with a key is recorded: the key, method, path, the **real** status of the answer, IP and time, kept 30
  days. Last used shows on the key.

### 4. The page

**API keys** under the avatar menu (`/:org/api-keys`):
- A list: name, prefix, scopes, last used, expires, status (active, expired). Revoke asks first.
- **New key**: name, scopes grouped by module (only those described in 2), requests a minute, expiry (optional). On
  save the key is shown once with Copy and a warning that it will not be shown again. The form keeps no draft of
  the key itself.
- A person with `ApiKeys.manageAll` (owners by default) sees every key in the organisation, with its person, and may
  revoke any; others see their own.
- Permissions: `ApiKeys.list`, `ApiKeys.create`, `ApiKeys.delete`, `ApiKeys.manageAll`.

### 5. Calling

`Authorization: Bearer <key>` on the API's own routes, as the web app's session does; no other version of the routes.

## Extension point

A product opens its routes to keys in its own route files (`->middleware('apikey')`); nothing else changes.

## Checks

- A key works on a route opened to it within its scopes; is refused on any other route (`403`), outside its scopes
  (`403`), when its person lost the permission (`403`), when expired or revoked (`401`), and over its limit (`429`).
- A key's organisation is its own, whatever header is sent.
- A key is never shown after it is made; only its hash is kept.
- Each use is recorded with the status the caller received.
