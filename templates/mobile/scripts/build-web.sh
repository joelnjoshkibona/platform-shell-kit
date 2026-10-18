#!/usr/bin/env bash
# Builds the {{PRODUCT_NAME}} web (../web) for the app and copies it in ((the product's phone app decision), (the product's phone app decision)):
#   - VITE_API_URL = {{PRODUCT_SLUG_UPPER}}_API_URL (from the environment, else mobile/.env, else production): the app talks to it;
#   - VITE_APP=1: the app build (always keeps you signed in); VITE_APP_VERSION = NATIVEPHP_APP_VERSION (mobile/.env);
#   - index.html → resources/spa/index.html (routes/web.php returns it for every path), assets → public/assets.
# Run it before `php artisan native:run` or a release build.
set -euo pipefail

MOBILE="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$MOBILE/../web"

if [ -z "${{{PRODUCT_SLUG_UPPER}}_API_URL:-}" ] && [ -f "$MOBILE/.env" ]; then
  {{PRODUCT_SLUG_UPPER}}_API_URL="$(sed -n 's/^{{PRODUCT_SLUG_UPPER}}_API_URL=//p' "$MOBILE/.env" | tail -n 1 | tr -d "\"'")"
fi
{{PRODUCT_SLUG_UPPER}}_API_URL="${{{PRODUCT_SLUG_UPPER}}_API_URL:-https://{{DOMAIN}}/api}"
# (the product's phone app decision): the web compares this with GET /app/version; it must be the version native:run builds (NATIVEPHP_APP_VERSION).
APP_VERSION="$(sed -n 's/^NATIVEPHP_APP_VERSION=//p' "$MOBILE/.env" 2>/dev/null | tail -n 1 | tr -d "\"'")"
[ -n "$APP_VERSION" ] || { echo "Set NATIVEPHP_APP_VERSION in mobile/.env first." >&2; exit 1; }
case "${{PRODUCT_SLUG_UPPER}}_API_URL" in
  http://127.0.0.1*) echo "{{PRODUCT_SLUG_UPPER}}_API_URL can't be 127.0.0.1: inside the app that is the app's own server. Use localhost with adb reverse." >&2; exit 1 ;;
esac

OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

echo "Building the web for app $APP_VERSION against ${{PRODUCT_SLUG_UPPER}}_API_URL"
(cd "$WEB" && VITE_API_URL="${{PRODUCT_SLUG_UPPER}}_API_URL" VITE_APP=1 VITE_APP_VERSION="$APP_VERSION" npm run build -- --outDir "$OUT" --emptyOutDir)

grep -q "${{PRODUCT_SLUG_UPPER}}_API_URL" "$OUT/assets/app.js" || { echo "The build doesn't carry ${{PRODUCT_SLUG_UPPER}}_API_URL: stopping." >&2; exit 1; }

rm -rf "$MOBILE/public/assets" "$MOBILE/resources/spa"
mkdir -p "$MOBILE/resources/spa"
cp "$OUT/index.html" "$MOBILE/resources/spa/index.html"
cp -R "$OUT/assets" "$MOBILE/public/assets"

echo "Copied: resources/spa/index.html and public/assets ($(du -sh "$MOBILE/public/assets" | cut -f1))"
