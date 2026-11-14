#!/usr/bin/env bash
# Builds, signs and publishes a {{PRODUCT_NAME}} app release (P68, P93).
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
#    --mandatory: older versions stop working (the app shows only its "has to be updated" screen).
# The signed APK is kept in mobile/dist/ (git-ignored).
#
# P79, when APP_UPDATE_FEED is set in mobile/.env (an app with no server of its own, or one published on a download page):
# step 4 publishes to the public download repo instead (APP_DOWNLOAD_REPO, e.g. owner/{{PRODUCT_SLUG}}-download, GitHub Pages on):
#   a. refuses a version code that is not newer than the one published;
#   b. builds as a release: APP_ENV=production and APP_DEBUG=false in the .env bundled into the APK (restored afterwards),
#      so debug-only screens are not in it and the feed must be https;
#   c. creates the GitHub Release v<version> with {{PRODUCT_SLUG}}-<version>.apk;
#   d. writes latest.json (the first note without a TYPE: prefix is the one-line summary, the others are the changes;
#      --mandatory makes this release the minimum), regenerates the page (make-download-page.mjs), commits and pushes;
#   e. waits until the published page serves the new latest.json.
# It needs `gh` signed in with push rights to that repo. The repo holds no source and no keys.
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

# Set before anything is changed: a run stopped at any point (an error, Ctrl-C, a kill) puts mobile/.env back.
cleanup() {
  rm -rf "${OUT:-}" "${QUIET:-}" "${PAGE_DIR:-}"
  [ -f "$MOBILE/.env.release-backup" ] && mv "$MOBILE/.env.release-backup" "$MOBILE/.env"
  return 0
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

FEED="$(env_of APP_UPDATE_FEED)"
DOWNLOAD_REPO="$(env_of APP_DOWNLOAD_REPO)"
APP_ID="$(env_of NATIVEPHP_APP_ID)"
if [ -n "$FEED" ]; then
  case "$FEED" in https://*) ;; *) die "APP_UPDATE_FEED must be https for a release (is $FEED)." ;; esac
  [ -n "$DOWNLOAD_REPO" ] || die "Set APP_DOWNLOAD_REPO (owner/repo of the download page) in mobile/.env."
  command -v gh >/dev/null || die "The GitHub CLI (gh) is needed to publish to $DOWNLOAD_REPO."
  PAGE_DIR="$(mktemp -d)"
  gh repo clone "$DOWNLOAD_REPO" "$PAGE_DIR" -- -q || die "Could not clone $DOWNLOAD_REPO."
  if [ -f "$PAGE_DIR/latest.json" ]; then
    PUBLISHED="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("versionCode",0))' "$PAGE_DIR/latest.json")"
    [ "$CODE" -gt "$PUBLISHED" ] || die "Version code $CODE is not newer than the published $PUBLISHED: bump NATIVEPHP_APP_VERSION_CODE."
  fi
  # b: a release build, whatever this checkout's .env says; the original comes back on exit
  cp "$MOBILE/.env" "$MOBILE/.env.release-backup"
  sed -i 's/^APP_ENV=.*/APP_ENV=production/; s/^APP_DEBUG=.*/APP_DEBUG=false/' "$MOBILE/.env"
elif [ "$BUILD_ONLY" = 0 ]; then
  [ -f "$ROOT/.env.deploy" ] || die "No .env.deploy at the repo root: it names the server (SERVER, SITE_DIR)."
  SERVER="$(sed -n 's/^SERVER=//p' "$ROOT/.env.deploy" | tail -n 1 | tr -d "\"'")"
  SITE_DIR="$(sed -n 's/^SITE_DIR=//p' "$ROOT/.env.deploy" | tail -n 1 | tr -d "\"'")"
  [ -n "$SERVER" ] && [ -n "$SITE_DIR" ] || die ".env.deploy needs SERVER and SITE_DIR."
fi

export {{PRODUCT_SLUG_UPPER}}_API_URL="${{{PRODUCT_SLUG_UPPER}}_API_URL:-https://{{DOMAIN}}/api}"
if [ "$(env_of APP_DATA_MODE)" != phone ]; then
  case "${{PRODUCT_SLUG_UPPER}}_API_URL" in https://*) ;; *) [ "$BUILD_ONLY" = 1 ] || die "A published release talks to an https API ({{PRODUCT_SLUG_UPPER}}_API_URL is ${{PRODUCT_SLUG_UPPER}}_API_URL)." ;; esac
fi

if [ -n "$FEED" ]; then
  echo "Releasing {{PRODUCT_NAME}} $VERSION ($CODE) to $DOWNLOAD_REPO (feed $FEED)"
else
  echo "Releasing {{PRODUCT_NAME}} $VERSION ($CODE) against ${{PRODUCT_SLUG_UPPER}}_API_URL"
fi
"$MOBILE/scripts/build-web.sh"

OUT="$(mktemp -d)"
# native:package opens the output folder with xdg-open when it is done; a new file-manager window would block this script.
QUIET="$(mktemp -d)"
printf '#!/bin/sh\nexit 0\n' > "$QUIET/xdg-open"
chmod +x "$QUIET/xdg-open"
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

if [ -n "$FEED" ]; then
  SHA="$(sha256sum "$KEPT" | cut -d' ' -f1)"
  SIZE="$(stat -c %s "$KEPT")"
  TAG="v$VERSION"
  NOTES_TEXT="$(printf '%s\n' "${NOTES[@]}")"
  gh release create "$TAG" "$KEPT" --repo "$DOWNLOAD_REPO" --title "{{PRODUCT_NAME}} $VERSION" --notes "$NOTES_TEXT" >/dev/null
  APK_URL="https://github.com/$DOWNLOAD_REPO/releases/download/$TAG/$(basename "$KEPT")"
  python3 - "$PAGE_DIR/latest.json" "$APP_ID" "$CODE" "$VERSION" "$APK_URL" "$SHA" "$SIZE" "${MANDATORY:+1}" "${NOTES[@]}" <<'PY'
import json, os, re, sys, datetime
out, app, code, name, apk, sha, size, mandatory, *notes = sys.argv[1:]
old = json.load(open(out)) if os.path.exists(out) else {}
summary, changes = None, []
for n in notes:
    m = re.match(r'^(NEW|IMPROVED|FIXED|SECURITY|ISSUE):\s*(.+)$', n)
    if m: changes.append({'type': m.group(1), 'text': m.group(2)})
    elif summary is None: summary = n
feed = {'app': app, 'versionCode': int(code), 'versionName': name, 'minimumCode': int(code) if mandatory else int(old.get('minimumCode', 1)),
        'apk': apk, 'sha256': sha, 'size': int(size), 'date': datetime.date.today().isoformat(), 'notes': summary or '', 'changes': changes}
json.dump(feed, open(out, 'w'), indent=2); open(out, 'a').write('\n')
PY
  node "$MOBILE/scripts/make-download-page.mjs" "$PAGE_DIR"
  (cd "$PAGE_DIR" && git add -A && git commit -qm "{{PRODUCT_NAME}} $VERSION" && git push -q)
  echo "Waiting for the page to serve $VERSION…"
  for _ in $(seq 1 40); do
    LIVE="$(curl -sf "$FEED?t=$(date +%s)" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("versionCode",0))' 2>/dev/null || echo 0)"
    [ "$LIVE" = "$CODE" ] && { echo "Published: ${FEED%/*}/"; exit 0; }
    sleep 15
  done
  die "Pushed, but $FEED does not serve version code $CODE yet: check the repo's Pages settings."
fi

REMOTE="/tmp/{{PRODUCT_SLUG}}-$VERSION-$$.apk"
scp -q "$KEPT" "$SERVER:$REMOTE"
NOTE_ARGS=""
for n in "${NOTES[@]}"; do NOTE_ARGS+=" --note=$(printf '%q' "$n")"; done
# As the site's own user (the owner of system/, www on aaPanel): files the release stores must be readable by the web
# server, and a root-made media folder is not (the download then answers 404).
ssh "$SERVER" "cd $(printf '%q' "$SITE_DIR/system") && chmod 644 $REMOTE && sudo -u \"\$(stat -c %U .)\" php artisan mobile:publish $REMOTE $VERSION $CODE$NOTE_ARGS $MANDATORY; status=\$?; rm -f $REMOTE; exit \$status"
curl -sf -o /dev/null -r 0-0 "https://{{DOMAIN}}/api/mobile/apk/download/$VERSION" || die "Published, but the download doesn't answer: check the media folder's owner on the server."
echo "Published: https://{{DOMAIN}}/app"
