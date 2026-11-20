// The `panneau-codemods` command, for Node only: `bin/panneau-codemods.js` runs it.
import { parseArgs } from 'node:util';

import { formatReport, runCodemods } from './run';
import { CODEMODS, type Codemod } from './transform';

export const USAGE = `Usage: panneau-codemods <codemod> <paths...> [--dry] [--json]

Codemods:
  v4-to-v5         Moves the JS of a Panneau 4 project to Panneau 5: the container of the app
                   becomes the plugin of the project, custom field components get their entry,
                   and imports of @panneau/* 4 are rewritten. What can't be rewritten is reported,
                   and marked with a // TODO(panneau-5) comment.
  button-variants  Replaces variant="primary|secondary|ghost|danger" of Button, LinkButton and
                   IconButton with the tone and appearance it stood for (Panneau 5 alphas).
  list-view-props  Groups the props of ListView and List into actions, inline and layouts
                   objects (Panneau 5 alphas).

  <paths>   Files and folders, read recursively. For v4-to-v5: the container of the app, its
            field components, and the entry written by \`php artisan panneau:install --upgrade\`.
  --dry     Report what would change, and write nothing.
  --json    Print the result as JSON.`;

/** Runs the command with its arguments. Returns the exit code. */
export async function runCli(
    args: readonly string[],
    { cwd = process.cwd(), log = console.log }: { cwd?: string; log?: (text: string) => void } = {},
): Promise<number> {
    let parsed;
    try {
        parsed = parseArgs({
            args: [...args],
            allowPositionals: true,
            options: {
                dry: { type: 'boolean', default: false },
                json: { type: 'boolean', default: false },
                help: { type: 'boolean', short: 'h', default: false },
            },
        });
    } catch (error) {
        log(`${error instanceof Error ? error.message : String(error)}\n\n${USAGE}`);
        return 2;
    }
    const { values, positionals } = parsed;
    const [command, ...paths] = positionals;
    if (values.help) {
        log(USAGE);
        return 0;
    }
    if (!CODEMODS.includes(command as Codemod) || paths.length === 0) {
        log(USAGE);
        return 2;
    }
    const result = await runCodemods({
        paths,
        dry: values.dry,
        cwd,
        codemod: command as Codemod,
    });
    log(values.json ? JSON.stringify(result, null, 2) : formatReport(result, { dry: values.dry }));
    return result.findings.some((finding) => finding.rule === 'parse') ? 1 : 0;
}
