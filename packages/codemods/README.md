# @panneau/codemods

Codemods that move Panneau 4 projects to Panneau 5: the app entry, imports and custom field components, with a report of what they can't rewrite.

```bash
npx @panneau/codemods@alpha v4-to-v5 resources/js/panneau.tsx resources/js/components/Panneau.jsx resources/js/components/panneau --dry
npx @panneau/codemods@alpha v4-to-v5 resources/js/panneau.tsx resources/js/components/Panneau.jsx resources/js/components/panneau
```

`--dry` writes nothing and prints what would change, and every finding: what the codemods couldn't rewrite, and what needs a check. Without it, the files are rewritten, and each finding to fix by hand also gets a `// TODO(panneau-5): …` comment in its file. Running the codemods again changes nothing more, and lists what is left. `--json` prints the result as JSON.

The steps, and what each rewrite does, are in the migration guide: [Custom fields](../../docs/migration.md#custom-fields).

| Export              | Content                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `@panneau/codemods` | `runCodemods()` (files on disk), `transformSources()` (sources in memory), `formatReport()` and `runCli()` |
| `panneau-codemods`  | The command (`bin`)                                                                                        |

## Why jscodeshift

The codemods are built on [jscodeshift](https://github.com/facebook/jscodeshift), the tool of the React and Next.js codemods:

- **It keeps the code as it was written.** Recast reprints only the nodes a codemod changes, so a component keeps its formatting, comments and quotes around a rewritten import or prop.
- **One parser for the code of v4 projects.** Babel's `tsx` parser reads their `.jsx` with PropTypes and their `.tsx` alike.
- **No type checker needed.** The rewrites are about imports, JSX and props, which the syntax gives. v4 projects don't typecheck cleanly (props destructured outside of their interface), and ts-morph would bring a second TypeScript and its program for nothing.

The codemods read every file of a run before they rewrite any: the container of the app says which components are fields, and the entry of v5 gets the plugin made from the container.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
