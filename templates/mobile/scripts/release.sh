#!/usr/bin/env bash
# Builds, signs and publishes a {{PRODUCT_NAME}} app release ((the product's phone app decision)).
#
#   scripts/release.sh "What changed" ["FIXED: what was fixed" ...] [--mandatory] [--build-only]
#
# 1. The version is mobile/.env's NATIVEPHP_APP_VERSION / _CODE: bump both first (a used version is refused).
# 2. Builds the web for the app against production (build-web.sh; {{PRODUCT_SLUG_UPPER}}_API_URL overrides it).
# 3. Packages and signs it (php artisan native:package android) with the release key, whose settings live OUTSIDE the
#    repo and the app (NativePHP zips the whole app into the APK): ${{PRODUCT_SLUG_UPPER}}_SIGNING, else ~/.{{PRODUCT_SLUG}}-keys/signing.env with
#    ANDROID_KEYSTORE_FILE, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD. Every update must be
#    signed with this same key, or phones refuse it: keep a copy of the folder somewhere safe.
# 4. Copies the APK to the server from ../.env.deploy (SERVER, SITE_DIR) and publishes it there with
#    `php artisan mobile:publish` (each note one line; TYPE: text, TYPE one of NEW, IMPROVED, FIXED, SECURITY, ISSUE).
#    --mandatory: older versions stop working (the app shows only "Update {{PRODUCT_NAME}} to keep going").
# The signed APK is kept in mobile/dist/ (git-ignored).
set -euo pipefail

MOBILE="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$MOBILE/.."
die() { echo "$*" >&2; exit 1; }

NOTES=()
MANDATORY=""
BUILD_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --mandatory) MANDATORY="--mandatory" ;;
    --build-only) BUILD_ONLY=1 ;;
    *) NOTES+=("$arg") ;;
  esac
done
[ "${#NOTES[@]}" -gt 0 ] || [ "$BUILD_ONLY" = 1 ] || die 'Say what changed: scripts/release.sh "What changed" [--mandatory]'

env_of() { sed -n "s/^$1=//p" "$MOBILE/.env" | tail -n 1 | tr -d "\"'" | sed 's/[[:space:]]*#.*//'; }
VERSION="$(env_of NATIVEPHP_APP_VERSION)"
CODE="$(env_of NATIVEPHP_APP_VERSION_CODE)"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "NATIVEPHP_APP_VERSION in mobile/.env must be X.Y.Z (is '$VERSION')."
[[ "$CODE" =~ ^[0-9]+$ ]] || die "NATIVEPHP_APP_VERSION_CODE in mobile/.env must be a number (is '$CODE')."

SIGNING="${{{PRODUCT_SLUG_UPPER}}_SIGNING:-$HOME/.{{PRODUCT_SLUG}}-keys/signing.env}"
[ -f "$SIGNING" ] || die "No signing settings at $SIGNING (see mobile/README.md, Release)."
set -a
# shellcheck disable=SC1090
. "$SIGNING"
set +a
for v in ANDROID_KEYSTORE_FILE ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
  [ -n "${!v:-}" ] || die "$v is missing from $SIGNING."
done
[ -f "$ANDROID_KEYSTORE_FILE" ] || die "No keystore at $ANDROID_KEYSTORE_FILE."

if [ "$BUILD_ONLY" = 0 ]; then
  [ -f "$ROOT/.env.deploy" ] || die "No .env.deploy at the repo root: it names the server (SERVER, SITE_DIR)."
  SERVER="$(sed -n 's/^SERVER=//p' "$ROOT/.env.deploy" | tail -n 1 | tr -d "\"'")"
  SITE_DIR="$(sed -n 's/^SITE_DIR=//p' "$ROOT/.env.deploy" | tail -n 1 | tr -d "\"'")"
  [ -n "$SERVER" ] && [ -n "$SITE_DIR" ] || die ".env.deploy needs SERVER and SITE_DIR."
fi

export {{PRODUCT_SLUG_UPPER}}_API_URL="${{{PRODUCT_SLUG_UPPER}}_API_URL:-https://{{DOMAIN}}/api}"
case "${{PRODUCT_SLUG_UPPER}}_API_URL" in https://*) ;; *) [ "$BUILD_ONLY" = 1 ] || die "A published release talks to an https API ({{PRODUCT_SLUG_UPPER}}_API_URL is ${{PRODUCT_SLUG_UPPER}}_API_URL)." ;; esac

echo "Releasing {{PRODUCT_NAME}} $VERSION ($CODE) against ${{PRODUCT_SLUG_UPPER}}_API_URL"
"$MOBILE/scripts/build-web.sh"

OUT="$(mktemp -d)"
# native:package opens the output folder with xdg-open when it is done; a new file-manager window would block this script.
QUIET="$(mktemp -d)"
printf '#!/bin/sh\nexit 0\n' > "$QUIET/xdg-open"
chmod +x "$QUIET/xdg-open"
trap 'rm -rf "$OUT" "$QUIET"' EXIT
export PATH="$QUIET:$PATH"
# native:package runs Gradle on a terminal (TTY); without one (a script, CI), `script` lends it a pseudo-terminal.
PACKAGE=(php artisan native:package android --build-type=release "--output=$OUT" --no-interaction)
if [ -t 0 ] && [ -t 1 ]; then
  (cd "$MOBILE" && "${PACKAGE[@]}")
else
  (cd "$MOBILE" && script -qefc "$(printf '%q ' "${PACKAGE[@]}")" /dev/null)
fi
APK="$(find "$OUT" -name '*.apk' | head -n 1)"
[ -n "$APK" ] || die "native:package left no APK in $OUT."

mkdir -p "$MOBILE/dist"
KEPT="$MOBILE/dist/{{PRODUCT_SLUG}}-$VERSION.apk"
cp "$APK" "$KEPT"
echo "Signed: $KEPT ($(du -h "$KEPT" | cut -f1), sha256 $(sha256sum "$KEPT" | cut -c1-16)…)"
[ "$BUILD_ONLY" = 0 ] || exit 0

REMOTE="/tmp/{{PRODUCT_SLUG}}-$VERSION-$$.apk"
scp -q "$KEPT" "$SERVER:$REMOTE"
NOTE_ARGS=""
for n in "${NOTES[@]}"; do NOTE_ARGS+=" --note=$(printf '%q' "$n")"; done
# As the site's own user (the owner of system/, www on aaPanel): files the release stores must be readable by the web
# server, and a root-made media folder is not (the download then answers 404).
ssh "$SERVER" "cd $(printf '%q' "$SITE_DIR/system") && chmod 644 $REMOTE && sudo -u \"\$(stat -c %U .)\" php artisan mobile:publish $REMOTE $VERSION $CODE$NOTE_ARGS $MANDATORY; status=\$?; rm -f $REMOTE; exit \$status"
curl -sf -o /dev/null -r 0-0 "https://{{DOMAIN}}/api/mobile/apk/download/$VERSION" || die "Published, but the download doesn't answer: check the media folder's owner on the server."
echo "Published: https://{{DOMAIN}}/app"
