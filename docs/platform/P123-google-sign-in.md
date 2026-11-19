# P123 Sign in with Google

**Amends** P2 (admin sign-in). **Owner**, 2026-11-19.

## Why

P2 signs people in with an identifier and a password, then a second step: an authenticator app or a code sent by email.
Many people in a product's organisations use a phone and a Google account, have a phone number but no email that they
read, and get stuck at the email code. Google already checks that the person holds the account (and its own two-step
verification when they turned it on), so asking again adds a step and no safety.

## The decision

- **Where:** the sign-in form shows "or" and **Continue with Google** under its Sign in button; the invitation page shows
  it beside "Set a password". Both only when the server has a Google client (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`);
  otherwise nothing is shown. `GET /auth/google` says whether it is on.
- **One step:** a Google sign-in is complete by itself. No email code, no authenticator, no "remember this device";
  it satisfies an organisation's "require 2FA".
- **Invited people only:** the account is found by Google's verified email (lower-cased). It must be an active person
  or a pending invitation; a pending person is activated by it and their invitation counts as accepted. Google never
  creates an account. A deactivated person is refused as a password sign-in would be.
- **Words on refusal:** not invited: "This Google account (a•••@gmail.com) has not been invited. Ask your administrator
  to invite this email." Not verified by Google: "Google has not verified this email." Cancelled at Google: back to the
  form with nothing said. Anything else: "Google sign-in did not work. Try again or use your password."
- **Phone app:** hidden until the app has a deep link to come back to (a later decision).

## How it works

1. `GET /auth/google/redirect?redirect=/path` keeps a random `state` for 10 minutes (with the path to open after) and
   sends the browser to Google (`openid email profile`, `prompt=select_account`).
2. `GET /auth/google/callback` takes the state once, swaps the code at Google's token endpoint on the server, and checks
   the id_token: Google's signature, `aud` is our client id, `iss` is Google, not expired, `email_verified`.
3. It finds the person (above) and keeps a **one-time code** for 60 seconds, then sends the browser to
   `<web>/login/google#code=…` (or `#error=not_invited|unverified|failed`). A fragment never reaches a server or a log.
4. The web app posts the code to `POST /auth/google/exchange` (rate-limited like sign-in) and gets the usual session
   (P2's token, open organisation), then continues as after any sign-in, including `?redirect=`.

Sign-in history records `google` as the method. Logs record the outcome and never the email or the token.

## Tests a product inherits

An active person signs in with no second step; an invited person is activated; an unknown and an unverified email are
refused; a state is used once; a one-time code works once; the button and routes are off without a client.
