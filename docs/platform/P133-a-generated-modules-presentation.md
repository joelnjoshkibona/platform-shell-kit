# P133 · A generated module's presentation

Status: **decided** (kit 1.53.0, generator contract 9). Amends P85 (empty values), FRONTEND_RULES "details pages"
(the header's Refresh, the Overview) and "forms and fields" (one field per row), P123 (what a spec says), P129 (the
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
- **Buttons.** Visible: Edit, plus the one defining action (P32/D39), the next action of a workflow when it has one.
  **Refresh moves into the More menu** (amends FRONTEND_RULES' "row 1: Refresh"). The page still refreshes itself
  after every action and on focus.

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
