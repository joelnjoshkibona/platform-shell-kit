# P131 · Media columns

Status: **decided** (kit 1.50.0). Amends P75, P102, P123 and P124. Owner 2026-11-21, rebuilding a legacy demo through the
generator: "media columns, built kit-first, on the web and the phone (camera/files)". Closes the files row of D14's gap
list.

## Decision

### 1. A column that holds a file

A module's record may hold one file per column: a photo, a receipt, a scan. The file lives in the Media library (Core
Media); the record holds a link to it, as Locations' photo already does (D49):

- **Stored** as `<name>_media_id` (a foreign key to `media`), **always nullable**: a phone in sync mode sends the record
  before its file (§3), so a column that had to be filled would refuse every record made offline. A product that needs a
  file before a record goes further checks it in an action (P84), not in the column.
- **Sent and read** as `<name>`: the media's **uuid** (in on create and edit, out on view and list). The service swaps
  the uuid for the id; an unknown uuid, or one outside the organisation, is refused with the field's reason.
- **Kept while used:** the module's `module.json` names it under `media_references` (`{ "<table>": ["<name>_media_id"] }`),
  so the library refuses to delete a file a record still uses (`MediaDeleteCheckService`).
- `accept`: `image` (the default) or `any`. One file per column; a gallery is a child module (P86) with a media column.

### 2. On the web

The form's field is the shell's **FilePicker** (FRONTEND_RULES "File picker"): Upload or Media library; the upload goes to
`POST /media/attach` at once and the field holds the uuid. The details page shows an image (`MediaThumb`, opens a preview)
or the file's name with View and Download; the list may show a small thumbnail.

### 3. On the phone

The form's field is **MediaField**: **Camera** and **Files** (the device plugin's `POST /device/photo` with
`source: camera|gallery`; a file through the plugin's file picker), a thumbnail, **Retake** and **Remove**. A photo the
camera took is kept by the plugin until the page acknowledges it, so it survives Android killing the app (P75).

- **Connected:** the file is uploaded at once (`POST /media/attach`); the field holds the uuid.
- **Sync:** the file is kept in the phone's store (its own table and folder) and the field holds `local:<id>` until it
  is sent. **A record's attachments go after the record** (P102): the record is sent with the column empty, then an
  `attach` change (`op: attach` on `POST /sync/push`: the module, the record, the column, the file) sends the file into
  the library and sets the link, through the module's own edit permission and version check. The feed sends the uuid;
  the phone shows the server's file once it has it, its own until then.
- **On the phone:** the file stays in the phone's store; **Back up now** carries it in the backup file and Restore puts
  it back.

### 4. Generated modules

A spec column `{ "name": "photo", "type": "media", "accept": "image", "nullable": true }` gives: the migration's
`photo_media_id`, the model's relation, the rules, the uuid swap in create, edit and view, `media_references`, the web
field and details, and with `phone: true` the phone field, the phone store's rules and the sync test's fields.
`generator_contract` **7** (with P123's 2026-11-21 amendment).

## Why

Records with a photo or a receipt are ordinary in the products the generator is for, and a picture taken in the field is
the phone app's commonest file. The library, the web picker, the delete check and the phone's camera already exist; this
names one way to join them so a generated module gets all of it from one column.

## Amended 2026-11-23 (the owner): one viewer for a file, before and after upload

"All places we want to display images or files we might need to have a preview or download component that will download
or preview such a file whether before uploading or after uploading."

- **One viewer** (web `MediaViewer`, phone `MediaViewer` sheet): an image full size, a PDF as the document itself (web),
  any other file as its card; always Download on the web, Share on the phone (Android's share list, through the app's own
  server: a PDF or an image, its type read from its content).
- **Everywhere a file shows, it opens the viewer**: a picker's rows (a file still on the device, before it is sent,
  included: "not sent yet"), an Overview field, a list's thumbnail (without opening the row), the phone's form and record
  page. `viewable: false` keeps a file closed where it must be.
- **A form is not saved while one of its files is still uploading** (`provideUploads`, counted by every picker inside):
  a test found a record saved before its photo had been handed over.

