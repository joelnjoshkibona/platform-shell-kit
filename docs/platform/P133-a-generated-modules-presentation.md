# P133 · A generated module's presentation

Status: **decided** (kit 1.53.0, generator contract 9). Amends P85 (empty values), FRONTEND_RULES "details pages"
(the Overview) and "forms and fields" (one field per row), P123 (what a spec says), P129 (the
phone's record page). Owner 2026-11-23, on the rebuilt V1 demo: "lots of weaknesses in our design, breaking layouts and
design that is absolutely not lovely". The owner chose two-column forms, leaving empty optional fields out, and
grouping related data into sections.

## Why

A generated module was laid out by column type only. The results:
- one column of facts across a 1000px card, with a "–" row for every empty field;
- the same circle icon for every module and the same chain-link icon for every relation;
- the record's photo in a card at the bottom, and an image module's tab with no thumbnails;
- a tab narrower than its Overview, and a status in tiny grey text;
- long single-column forms that asked for fields the system fills (approved by, recorded by);
- a flat alphabetical sidebar that listed modules which only live as tabs;
- a phone bottom bar chosen by folder name.

Bootbox's hand-written Location pages already did better. This decision writes down what they do, so the generator
can do it too.

## Decision

### 1. Sections

A module's fields are grouped into named **sections**, and the same sections serve three places:
- the Overview cards;
- the form's headed groups;
- the phone record page's groups.

The default sections, by kind of column:

| Section | Columns |
| --- | --- |
| Details | the name, strings, fixed lists, yes/no |
| Amounts | whole numbers and decimals; a document's subtotal, tax and total |
| Links | links to other records, the location |
| Dates | dates and times (a calendar's start and end) |
| Notes | long text |
| Timeline | created, created by, updated, updated by: always last, never in a form |

A spec may name its own sections: `"sections": [{ "key", "label", "label_sw", "columns": [...] }]`. They come first,
in its order. Columns it does not list fall into the defaults. An empty section is not shown.

### 2. The Overview

- **Layout.** One card per section, titled, with two cards side by side from `lg`. Inside a card, a label/value grid:
  label column 8rem, values in tabular numbers where they are numbers.
- **The picture.** If the module has an image column, its first one is the record's picture: a photo card first on the
  Overview, with a dashed "no photo" state.
- **Empty values (amends P85).** An **empty optional field is left out**. A required field shows "–" when empty, and
  the Timeline always shows. Editing still shows every field.
- **Icons.** The same icon per kind of field (FRONTEND_RULES' list): `Hash` for codes and references, `AlignLeft` for
  notes, `FileText` for descriptions, `CalendarDays` for dates, `Banknote` for amounts, `MapPin` for a location,
  `UserRound` for a person. Otherwise the linked module's own icon, never one icon for every link.

### 3. The header

- **One line:** the icon tile (or the record's picture), title, its number as the code, and the status as a
  `StatusPill` at the header's text size. The status is a workflow column, or a link to the platform's Statuses.
- **Meta:** a document's total sits in the meta line under the title.
- **Buttons.** Visible: Refresh, Edit, plus the one defining action (P32/D39), the next action of a workflow when it
  has one. Refresh stays a visible button (the owner, 2026-11-23: "Refresh should stay outside").

### 4. Lists and tabs

- **Thumbnails.** A module with an image column shows a 40px thumbnail as its list's first column. A module whose
  name is an image's caption (an images child) lists as a grid of thumbnail cards (`CardGrid` + `MediaThumb`).
- **Width.** A tab that shows records is as wide as the Overview: no narrower inner page.

### 5. Forms (amends FRONTEND_RULES' "one field per row")

- **Two columns** from `sm`, with headed groups by section. Short fields (dates, amounts, choices, links, codes) pair.
  Long text, media, JSON and lines span both columns. One column on a phone.
- **Order.** Required fields first in their section; the location sits with Links, never after the lines.
- **Labels.** Every field has a visible label, dates and times too.
- **Fields the system fills are not in the form.** A column says who fills it:
  - `"fill": "user"`: the signed-in user, set by the server when the record is made (recorded by);
  - `"fill": "workflow"`: set by an action (approved by, approved at);
  - `"fill": "server"`: set by the server some other way.

  Such a column shows on the Overview, never in a form. The generator warns about a link to Users named `*_by` without
  `fill`.
- **Choices.** A short fixed list is a choice (Select; OptionPick on the phone), never free text. A string column with
  `values` is one. The generator warns about a string named like a kind (`type`, `kind`, `direction`, `method`,
  `category`) without `values`.

### 6. Numbers

Every number reads as people read it (`formatAmount`): thousands separated, a decimal column's places kept, a document
line's quantity and VAT rate without trailing zeros ("1", "18").

### 7. Navigation

- **Icons.** Every module has its own icon, a Lucide name, checked by the generator against Lucide's names. `Circle` is
  refused. The converter and the Project Generator suggest one from the module's name.
- **Sidebar sections.** `"menu": { "section", "position", "hidden" }` puts a product's modules into named sidebar
  sections. A section is declared once, on any module that uses it: `"menu_section": { "key", "title", "title_sw",
  "icon", "position" }`. A regenerated module's menu row is updated (its icon, section, place), never duplicated.
- **Tab-only modules.** A module that lives as another's tab (`tab_on`) has no menu entry unless `menu.hidden: false`.

### 8. The phone (amends P129)

- **Bottom bar.** `"phone": { "tab": true, "order": 1 }` picks the bottom bar's modules: at most three, by order. A
  module without it is in the drawer only.
- **Record page.** The sections as headed groups, empty optional fields left out, and the status as a `StatusPill`. The
  defining action is the primary button; Edit is secondary.
- **Sync page.** It names modules by their titles, never their keys.

## How it is checked

The golden modules are rewritten to this by hand first. The generator is made to equal them, and the release check's
generated-vs-golden comparison keeps it so. A product's screens are reviewed against this decision as a checklist (the
review checklist in FRONTEND_RULES), by the builder and by a second reviewer who has not seen the first's conclusions.

## Amended 2026-11-23 (the owner): fields on a quarter grid, label on top

The owner, after the first rebuild: label on top and value below, with "customizable column span such that we can have
the first 50/50, second 25,25,25,25, third 75,25, or 25,75, another 100", for the Overview **and** forms.

- **One grid, four quarters.** Every Overview card and every form lays its fields on a 4-column grid; a field spans 1, 2,
  3 or 4 quarters (25, 50, 75, 100%). On a tablet a field is 1 or 2 halves; on a phone every field is full width.
- **Label on top**, the value under it (small muted label, the value at text size): long values wrap, nothing is squeezed.
- **Defaults by kind** (Overview): a number, date, yes/no, fixed list or code 1; a link or a short text 2; long text 4;
  the record's picture 1, first in its card. Forms: 2 (two fields a row, as before), long text, files and lines 4.
- **The spec overrides** with `"span": 1–4` on a column (both places). Fields keep the spec's order; a row whose spans do
  not reach four ends with a gap (the spec editor says so), never reshuffled.
- **Cards are full width**, one section a row; the picture is the first field of the first card, not a card of its own.

## Amended 2026-11-23 (the owner, second round): the Overview reads like a statement; the open items closed

From a screenshot the owner liked ("isn't this a good idea, but adjust it on small screens"), and their decisions on the
items the first round left open.

### The Overview's look (replaces "label on top" on the Overview; forms keep the quarter grid)

- **A row**: a faint label (muted, regular weight, no kind icon) and a bright value (full contrast, medium weight; codes
  mono, amounts tabular) on one line, a hairline under every row.
- **By the card's own width** (container queries, never the screen's): wide, two columns of rows; medium (a tablet), one
  column, the label as wide as it needs (at most 45%), the value right-aligned; narrow (a phone, under 26rem), the label on
  top and the value under it. Long text and the record's picture always take a full row, label on top.
- **Spans on the Overview**: a wide card holds two rows side by side, so a field of 1–2 quarters takes half a row and one
  of 3–4 the full row.
- **Short values never wrap** (a date, a phone, a code, an amount, a link): cut with … and shown whole on hover. The
  screenshot broke "0745876498" and "23 Nov 2026" mid-word in half-cards of 190px; that is what this prevents.
- **The links beside the rest**: on a wide page (the Overview 56rem or more) the Links card stands in a column of its own
  (18rem) to the right; narrower, it keeps its place between the other cards.
- **The phone's rows**: the same faint label and bright value, a hairline between rows; a value too long to sit beside its
  label moves under it, whole.

### The phone record page and form

- **Compact**: the record page's sections that hold six fields or fewer between them become one Details card, the rule
  the web already follows (one rule, `Sections::compact`, for both).
- **The status on the phone form** follows the web's: not on create (a record starts in the first status); on edit only
  the statuses no action leads to; left out when none is left.

### A gallery: `"list": "grid"`

A module whose records are mainly an image (an item's images) lists as a grid of thumbnails with their captions (web
CardGrid, phone PhotoGrid), in its own list and as a tab. It is chosen in the spec (`"list": "grid"`, a toggle in the spec
editor), never guessed: a guess would tip a module with a photo and many fields into a grid. `grid` needs an image column
(else the spec is refused); the generator warns when a module looks like a gallery without the key.

### A locked status: no Edit

A status may say `"locked": true` (default: its `is_terminal`). In a locked status the record is not edited: Edit is not
offered (web header, phone record page), a note under the header says why ("Approved: no longer edited"), and the server
refuses an edit (422). Actions still run (Mark paid from Approved). The demo's Approved and Paid are locked.

### Smaller rules

- **An action's toast** says what happened: its `done` text, by default the status it leads to ("Submitted", "Approved"),
  else "{Action} done"; never the button's own word.
- **The Timeline** shows Created and Created by, and Updated and Updated by when the record was changed after it was made
  (an action sets who changed it too).
- **Copy link** in every record's More menu (the record's address); a one-record export is not offered (a printable
  record may come later as its own feature).
- **The list's search** names the module in its chip ("Expenses"), the placeholder says "Search expenses": the same words
  never twice in one box.
- **The spec editor** points out a row of the form that does not fill its four quarters ("leaves a gap of 1 quarter"),
  computed the way the browser lays it out.

