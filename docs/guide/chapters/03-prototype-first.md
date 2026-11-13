# Prototype first

Before any server or app code, a product is drawn as a **clickable prototype**: a single `index.html` that looks and behaves like the finished product, with fake data. People click through it, argue about it and agree on it. Changing a prototype costs minutes; changing built code costs days.

## Making one

1. Copy the kit's `prototype/` into the product's `docs/design/prototype/`.
2. Edit `src/product.js`: the product's name, icon, domain and accent colour, and optionally its own curtain loader (`loader`, P114).
3. Replace `src/parts_product.js`, the **product registry** (P110), with the product's: its permissions, what each role gets of them, and its detail pages that live inside the shell. The shell is built from it, so the kit's own files stay as they are and the next kit update applies cleanly.
4. Add the product's modules as new files, `src/parts_<module>.js` (a task tracker: `parts_tasks.js`), listed in `assemble.py` where the example's `parts_example.js` is. Register their menu items, routes and links at the kit's extension points (the table in the kit `README.md`), and register each record type with `defineModule` so links and Back work.
5. Remove the example product's modules (forms, templates, builder, results).
6. Run `python3 src/assemble.py`. It joins the parts into `index.html`.
7. Open `index.html` in a browser. The **Screens** button at the bottom left jumps to every screen.

```bash
cd docs/design/prototype
python3 src/assemble.py      # → index.html and the component docs
```

The registry, in the prototype:

```js
const PRODUCT_REGISTRY = {
  permissions: [{ name: 'Tasks.list', label: 'See tasks', module: 'Tasks' }, { name: 'Tasks.create', label: 'Create tasks', module: 'Tasks' }],
  roles: { editor: { desc: 'Plans and does the work.', perms: ['Tasks.list', 'Tasks.create'] }, viewer: { perms: ['Tasks.list'] } },
  detailRoutes: [{ route: 'task', title: (G) => taskById(G.taskId).title, parent: 'tasks' }],
};
```

## Checking it

Every screen is checked at 1280px wide in light mode and 390px wide in dark mode, at least: no errors in the browser console, no sideways scrolling, nothing cut off. The kit's `tools/prototype-shots/` takes the screenshots that later prove the real app matches.

> **Watch out**: Write a D decision for every product choice you make while drawing (what a field means, who can see what, what happens on delete). The prototype shows the result; the decision keeps the reason.

## The phone app's prototype

A product with a phone app draws it separately in `docs/design/prototype-phone/` (from the kit's `prototype-phone/`). It is drawn for a phone only, 360 to 430 pixels wide, with its own shell (bottom bar, sheets) and its own screens. It shares the data and the decisions with the web prototype, not its components.
