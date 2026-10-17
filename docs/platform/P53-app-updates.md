# P53 · App updates

Status: **decided** (kit 1.7.0). The DevBiz owner chose "ask, but force when needed".

## Decision

The app compares its own version with two numbers from the server: `latest` and `minimum`.

- **Below `latest`:** a banner at the top of the content, "A new version of <product> is ready", with **Later**
  (hidden until the next version) and **Update**.
- **Below `minimum`:** the server says this version no longer works with it (an API change). A full screen, "Update
  <product> to keep going", with **Update now** and the two versions; nothing else is reachable.
- Update opens the store listing or the download page. Nothing saved is lost, and drafts survive the update.

## Contract

`GET /app/version` → `{ latest, minimum, url }`, cached by the app for an hour and checked on every launch.
