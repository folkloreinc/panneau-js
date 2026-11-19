# @panneau/codemods

Codemods that move Panneau 4 projects to Panneau 5: the app entry, imports and custom field components, with a report of what they can't rewrite.

```bash
npx @panneau/codemods@alpha v4-to-v5 resources/js/panneau.tsx resources/js/components/Panneau.jsx resources/js/components/panneau --dry
npx @panneau/codemods@alpha v4-to-v5 resources/js/panneau.tsx resources/js/components/Panneau.jsx resources/js/components/panneau
```

`--dry` writes nothing and prints what would change, and every finding: what the codemods couldn't rewrite, and what needs a check. Without it, the files are rewritten (format them with Prettier afterwards), and each finding to fix by hand also gets a `// TODO(panneau-5): …` comment in its file. Running the codemods again changes nothing more, and lists what is left. `--json` prints the result as JSON.

The steps, and what each rewrite does, are in the migration guide: [Custom fields](../../docs/migration.md#custom-fields).

## Button variants

The first alphas of Panneau 5 had aliases for the look of a button: `variant="primary"`, `secondary`, `ghost` and `danger`. Panneau 5.0 drops them for `tone` and `appearance`. `button-variants` rewrites them on `Button`, `LinkButton` and `IconButton` of `@panneau/ui`:

```bash
npx @panneau/codemods@alpha button-variants resources/js --dry
npx @panneau/codemods@alpha button-variants resources/js
```

| Alias       | `Button`, `LinkButton` | `IconButton`    |
| ----------- | ---------------------- | --------------- |
| `primary`   | `tone="accent"`        | `tone="accent"` |
| `secondary` | (nothing: the default) | (nothing)       |
| `ghost`     | `appearance="ghost"`   | (nothing)       |
| `danger`    | `tone="danger"`        | `tone="danger"` |

The codemod leaves out what the button has without them (a neutral button is outlined, another tone is solid, an `IconButton` is always a ghost button), rewrites conditions over aliases (`variant={retry ? 'secondary' : 'primary'}`), and keeps a `tone` or an `appearance` given beside the variant. Named variants of a theme (`variant="pill"`) stay. It reports a `variant` it can't read (a variable) and `variant: 'primary'` in objects of props, such as the `args` of a story.

| Export              | Content                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/codemods` | `runCodemods()` (files on disk), `transformSources()` (sources in memory), `formatReport()` and `runCli()`, with the codemod to run (`v4-to-v5` by default, or `button-variants`) |
| `panneau-codemods`  | The command (`bin`)                                                                                                                                                               |

## Why jscodeshift

The codemods are built on [jscodeshift](https://github.com/facebook/jscodeshift), the tool of the React and Next.js codemods:

- **It keeps the code as it was written.** Recast reprints only the nodes a codemod changes, so a component keeps its formatting, comments and quotes around a rewritten import or prop.
- **One parser for the code of v4 projects.** Babel's `tsx` parser reads their `.jsx` with PropTypes and their `.tsx` alike.
- **No type checker needed.** The rewrites are about imports, JSX and props, which the syntax gives. v4 projects don't typecheck cleanly (props destructured outside of their interface), and ts-morph would bring a second TypeScript and its program for nothing.

The codemods read every file of a run before they rewrite any: the container of the app says which components are fields, and the entry of v5 gets the plugin made from the container.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
