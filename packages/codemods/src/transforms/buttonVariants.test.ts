import { describe, expect, it } from 'vitest';

import { transformSources } from '../transform';

/** Rewrites one file with the `button-variants` codemod. */
function run(source: string, path = 'Page.tsx') {
    const { outputs, findings } = transformSources(
        new Map([[`/project/${path}`, source]]),
        '/project',
        'button-variants',
    );
    return {
        output: outputs.get(`/project/${path}`) ?? null,
        messages: findings.map((finding) => `${finding.line ?? '-'} ${finding.message}`),
    };
}

const ui = "import { Button, IconButton, LinkButton } from '@panneau/ui';\n\n";

describe('the button-variants codemod', () => {
    it('gives each alias the tone and the appearance it stood for, without the defaults', () => {
        const { output, messages } = run(
            `${ui}export const a = <Button variant="primary">Save</Button>;
export const b = <Button variant="secondary">Cancel</Button>;
export const c = <Button size="sm" variant="ghost" onPress={clear}>Clear</Button>;
export const d = <LinkButton href="/" variant="danger">Delete</LinkButton>;
`,
        );
        expect(output).toBe(`${ui}export const a = <Button tone="accent">Save</Button>;
export const b = <Button>Cancel</Button>;
export const c = <Button size="sm" appearance="ghost" onPress={clear}>Clear</Button>;
export const d = <LinkButton href="/" tone="danger">Delete</LinkButton>;
`);
        expect(messages).toEqual([]);
    });

    it('rewrites conditions over aliases', () => {
        const { output } = run(
            `${ui}export const a = <LinkButton href="/" variant={retry ? 'secondary' : 'primary'}>Home</LinkButton>;
export const b = <Button variant={changed ? 'primary' : undefined}>Crop</Button>;
export const c = <Button variant={done ? 'ghost' : 'danger'}>Stop</Button>;
`,
        );
        expect(output).toContain(`tone={retry ? 'neutral' : 'accent'}>Home`);
        expect(output).toContain(`tone={changed ? 'accent' : undefined}>Crop`);
        expect(output).toContain(
            `tone={done ? 'neutral' : 'danger'} appearance={done ? 'ghost' : 'solid'}>Stop`,
        );
    });

    it('gives IconButton the tone only: it is a ghost button whatever its variant', () => {
        const { output } = run(
            `${ui}export const a = <IconButton icon={Trash} label="Delete" variant="danger" />;
export const b = <IconButton icon={Plus} label="Add" variant="secondary" />;
`,
        );
        expect(output).toContain('<IconButton icon={Trash} label="Delete" tone="danger" />');
        expect(output).toContain('<IconButton icon={Plus} label="Add" />');
    });

    it('keeps a tone or an appearance given beside the variant', () => {
        const { output } = run(
            `${ui}export const a = <Button tone="info" variant="primary">Open</Button>;
export const b = <Button appearance="subtle" variant="danger">Drop</Button>;
`,
        );
        expect(output).toContain('<Button tone="info" appearance="solid">Open</Button>');
        expect(output).toContain('<Button appearance="subtle" tone="danger">Drop</Button>');
    });

    it('follows renamed imports, and leaves other components and named variants', () => {
        const source = `import { Button as UiButton } from '@panneau/ui';
import { Button } from 'some-library';

export const a = <UiButton variant="pill">Pill</UiButton>;
export const b = <Button variant="primary">Other</Button>;
`;
        expect(run(source).output).toBeNull();
        expect(
            run(
                `import { Button as UiButton } from '@panneau/ui';\n\nexport const a = <UiButton variant="ghost" />;\n`,
            ).output,
        ).toContain('<UiButton appearance="ghost" />');
    });

    it('reports what it cannot rewrite', () => {
        const { output, messages } = run(
            `${ui}const style = { variant: 'secondary' } as const;
export const a = <Button variant={kind}>Go</Button>;
export const b = <Button {...style}>Go</Button>;
`,
        );
        expect(output).toBeNull();
        expect(messages).toEqual([
            "4 `variant` of `Button` isn't an alias the codemod can read: give it a `tone` and an `appearance` instead of `primary`, `secondary`, `ghost` or `danger`",
            "3 `variant: 'secondary'` in an object: if it goes to a button, give it the `tone` and `appearance` of `secondary` instead",
        ]);
    });

    it('leaves a file without an alias as it is, even what recast would print again', () => {
        const source = `${ui}export const crumbs = tail.map((item) => ({ kind: 'item', item }) as const);
export const a = <Button tone="accent">Save</Button>;
`;
        expect(run(source).output).toBeNull();
    });

    it('changes nothing in a second run', () => {
        const first = run(`${ui}export const a = <Button variant="ghost">Clear</Button>;\n`).output;
        expect(first).not.toBeNull();
        expect(run(first ?? '').output).toBeNull();
    });
});
