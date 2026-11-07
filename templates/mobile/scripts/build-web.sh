#!/usr/bin/env bash
# P93: builds the phone app's interface (resources/spa, its own Vite project) into public/spa, where routes/web.php serves it.
# The interface is the phone app's own; nothing of ../web is built or copied. Run before `php artisan native:run` and a release.
#   - VITE_API_URL = {{PRODUCT_SLUG_UPPER}}_API_URL (from the environment, else .env, else production): the remote API the interface calls;
#   - VITE_APP_VERSION = NATIVEPHP_APP_VERSION (.env): compared with the update feed (P67, P79).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPA="$ROOT/resources/spa"

if [ -z "${{{PRODUCT_SLUG_UPPER}}_API_URL:-}" ] && [ -f "$ROOT/.env" ]; then
  {{PRODUCT_SLUG_UPPER}}_API_URL="$(sed -n 's/^{{PRODUCT_SLUG_UPPER}}_API_URL=//p' "$ROOT/.env" | tail -n 1 | tr -d "\"'")"
fi
{{PRODUCT_SLUG_UPPER}}_API_URL="${{{PRODUCT_SLUG_UPPER}}_API_URL:-https://{{DOMAIN}}/api}"
APP_VERSION="$(sed -n 's/^NATIVEPHP_APP_VERSION=//p' "$ROOT/.env" 2>/dev/null | tail -n 1 | tr -d "\"'")"
[ -n "$APP_VERSION" ] || { echo "Set NATIVEPHP_APP_VERSION in .env first." >&2; exit 1; }
case "${{PRODUCT_SLUG_UPPER}}_API_URL" in
  http://127.0.0.1*) echo "{{PRODUCT_SLUG_UPPER}}_API_URL can't be 127.0.0.1: inside the app that is the app's own server. Use localhost with adb reverse." >&2; exit 1 ;;
esac

[ -d "$SPA/node_modules" ] || (cd "$SPA" && npm ci --no-audit --no-fund)
(cd "$SPA" && VITE_API_URL="${{PRODUCT_SLUG_UPPER}}_API_URL" VITE_APP_VERSION="$APP_VERSION" npx vue-tsc --noEmit && VITE_API_URL="${{PRODUCT_SLUG_UPPER}}_API_URL" VITE_APP_VERSION="$APP_VERSION" npx vite build)
[ -f "$ROOT/public/spa/index.html" ] || { echo "The build has no index.html: stopping." >&2; exit 1; }
grep -rq "${{PRODUCT_SLUG_UPPER}}_API_URL" "$ROOT/public/spa/assets" || { echo "The build doesn't carry the API URL: stopping." >&2; exit 1; }
echo "Built: public/spa ($(du -sh "$ROOT/public/spa" | cut -f1)) against ${{PRODUCT_SLUG_UPPER}}_API_URL"
