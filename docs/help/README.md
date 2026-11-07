# The user guide (P98)

For the people who **use** a product: one article per task, with pictures where numbered markers ①②③ point at what the text talks about.

```
docs/help/
├── articles/en/<id>.md     the articles (Markdown + front matter + ::: shot specs); another language = another folder
├── shots/                  the marked pictures, made by the tool (desktop light, phone dark): never edit by hand
├── help.json               the articles as data, read by the app's Help and guides
└── index.html              one page with every article and a search, to share or print
```

```bash
node tools/help/build.js                 # after adding or changing an article, or a screen it shows
node tools/help/build.js --only <id>     # one article's pictures
node tools/help/build.js --text          # text only (no browser)
node tools/help/build.js --check         # CI: every marker still finds its element, outputs up to date
tools/help/test/run.sh                   # the tool's own test
```

The format is at the top of `tools/help/build.js` and in `docs/platform/P98-the-user-guide.md`. These six are the kit's core articles; a product keeps them (adjusting routes and names) and adds its own.
