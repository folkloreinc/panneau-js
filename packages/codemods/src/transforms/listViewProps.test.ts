import { describe, expect, it } from 'vitest';

import { transformSources } from '../transform';

/** Rewrites one file with the `list-view-props` codemod. */
function run(source: string, path = 'Page.tsx') {
    const { outputs, findings } = transformSources(
        new Map([[`/project/${path}`, source]]),
        '/project',
        'list-view-props',
    );
    return {
        output: outputs.get(`/project/${path}`) ?? null,
        messages: findings.map((finding) => `${finding.line ?? '-'} ${finding.message}`),
    };
}

const lists = "import { List, ListView } from '@panneau/lists';\n\n";

describe('the list-view-props codemod', () => {
    it('groups the props of ListView into actions, inline and layouts', () => {
        const { output, messages } = run(
            `${lists}export const a = (
    <ListView
        list={list}
        actions={actions}
        onAction={run}
        previewAction={preview}
        layouts={['table', 'cards']}
        layout="cards"
        onLayoutChange={setLayout}
        inlineEdit={['title']}
        onInlineEdit={save}
        formatError={formatError}
        primaryAction="edit"
        aria-label="Pages"
    />
);
`,
        );
        expect(messages).toEqual([]);
        expect(output).toContain(
            'actions={{\n            available: actions,\n            onRun: run,\n            preview,\n            primary: "edit"\n        }}',
        );
        expect(output).toContain(
            "layouts={{\n            available: ['table', 'cards'],\n            current: \"cards\",\n            onChange: setLayout\n        }}",
        );
        expect(output).toContain(
            "inline={{\n            fields: ['title'],\n            onEdit: save,\n            formatError\n        }}",
        );
        expect(output).not.toMatch(/onAction=|previewAction=|layout=|inlineEdit=|primaryAction=/);
        expect(output).toContain('aria-label="Pages"');
    });

    it('rewrites List too, and changes nothing in a second run', () => {
        const first = run(
            `${lists}export const a = <List items={items} actionIcons={icons} />;\n`,
        ).output;
        expect(first).toContain('<List items={items} actions={{\n  icons\n}} />');
        expect(run(first ?? '').output).toBeNull();
    });

    it('leaves other components, and reports spread props', () => {
        expect(
            run(
                'import { ListView } from \'elsewhere\';\n\nexport const a = <ListView layout="cards" />;\n',
            ).output,
        ).toBeNull();
        const { output, messages } = run(
            `${lists}export const a = <ListView {...resolved} list={list} onAction={run} />;\n`,
        );
        expect(output).toContain('actions={{\n  onRun: run\n}}');
        expect(messages).toEqual([
            '3 `ListView` gets spread props: if they hold `actions`, `onAction`, `layouts`, `layout`, `inlineEdit` or the other props that 5.0 groups, give them as `actions`, `inline` and `layouts` objects',
        ]);
    });
});
