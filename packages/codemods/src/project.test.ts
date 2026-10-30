import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

import { formatReport } from './run';
import { transformSources } from './transform';

const fixture = join(import.meta.dirname, '__fixtures__', 'project');
const input = join(fixture, 'input');

/** The files of a folder, by path. */
function readFolder(folder: string): Map<string, string> {
    const files = new Map<string, string>();
    readdirSync(folder, { recursive: true, withFileTypes: true }).forEach((entry) => {
        if (entry.isFile()) {
            const path = join(entry.parentPath, entry.name);
            files.set(path, readFileSync(path, 'utf8'));
        }
    });
    return files;
}

// The fixture is a v4 project made of generic copies of the patterns of real projects: the
// container of the app, field components in TypeScript and JavaScript with PropTypes, displays
// and actions, and the entry that `panneau:install --upgrade` writes.
describe('a v4 project', () => {
    const sources = readFolder(input);
    const result = transformSources(sources, input);

    it.each([...sources.keys()].map((path) => relative(input, path)))(
        'rewrites %s',
        async (path) => {
            const file = join(input, path);
            await expect(result.outputs.get(file) ?? sources.get(file)).toMatchFileSnapshot(
                join(fixture, 'output', path),
            );
        },
    );

    it('reports what it could not rewrite', async () => {
        const report = formatReport({
            files: [...sources.keys()].map((path) => relative(input, path)).sort(),
            changed: [...result.outputs.keys()].map((path) => relative(input, path)),
            findings: result.findings,
        });
        await expect(`${report}\n`).toMatchFileSnapshot(join(fixture, 'report.txt'));
    });

    it('changes nothing when run again, and still lists what is left', () => {
        const rewritten = new Map(
            [...sources].map(([path, source]) => [path, result.outputs.get(path) ?? source]),
        );
        const again = transformSources(rewritten, input);
        expect([...again.outputs.keys()]).toEqual([]);
        // What is left is listed again, from the code or from its `TODO(panneau-5)` comments.
        const first = new Set(
            result.findings.map((finding) => `${finding.file} ${finding.message}`),
        );
        expect(
            again.findings.filter((finding) => !first.has(`${finding.file} ${finding.message}`)),
        ).toEqual([]);
        // Only notes without a comment are not repeated.
        const repeated = new Set(
            again.findings.map((finding) => `${finding.file} ${finding.message}`),
        );
        result.findings
            .filter((finding) => !repeated.has(`${finding.file} ${finding.message}`))
            .forEach((finding) => {
                expect(finding.message).toMatch(
                    /forwards `\.\.\.props`|the container is now the plugin/,
                );
            });
    });
});
