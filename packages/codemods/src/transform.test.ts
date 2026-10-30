import { describe, expect, it } from 'vitest';

import { transformSources } from './transform';

/** Rewrites files given by path, under `/project`. */
function run(files: Record<string, string>) {
    const sources = new Map(
        Object.entries(files).map(([path, source]) => [`/project/${path}`, source]),
    );
    const { outputs, findings } = transformSources(sources, '/project');
    return {
        output: (path: string) => outputs.get(`/project/${path}`) ?? null,
        messages: findings.map(
            (finding) => `${finding.file}:${finding.line ?? '-'} ${finding.message}`,
        ),
        findings,
    };
}

describe('transformSources', () => {
    it('reports a file it cannot parse, and leaves it', () => {
        const { output, findings } = run({ 'broken.jsx': 'export default function (' });
        expect(output('broken.jsx')).toBeNull();
        expect(findings).toMatchObject([{ file: 'broken.jsx', line: null, rule: 'parse' }]);
    });

    it('leaves files without Panneau 4 alone', () => {
        const { output, findings } = run({
            'app.tsx':
                "import { definePlugin } from '@panneau/core';\n\nexport default definePlugin({ id: 'app' });\n",
        });
        expect(output('app.tsx')).toBeNull();
        expect(findings).toEqual([]);
    });

    it('leaves a file that only recast would reformat', () => {
        const source = [
            'export function isChunkError(name: string, message: string): boolean {',
            '    return (',
            "        name === 'ChunkLoadError' ||",
            '        /Loading chunk/i.test(message)',
            '    );',
            '}',
            '',
        ].join('\n');
        expect(run({ 'chunk.ts': source }).output('chunk.ts')).toBeNull();
    });

    it('reports the v4 names of packages that v5 also has', () => {
        const { output, messages } = run({
            'types.ts':
                "import type { PanneauDefinition } from '@panneau/core';\nimport { useForm } from '@panneau/core';\n\nexport type D = PanneauDefinition;\nexport const f = useForm;\n",
        });
        expect(messages).toEqual([
            'types.ts:1 `PanneauDefinition` of `@panneau/core` has no equivalent in Panneau 5: see the migration guide',
        ]);
        expect(output('types.ts')).toContain(
            '// TODO(panneau-5): `PanneauDefinition` of `@panneau/core` has no equivalent',
        );
    });

    it('reports the ids of `useFieldComponent()` it cannot replace', () => {
        const { output, messages } = run({
            'Field.jsx': [
                "import { useFieldComponent } from '@panneau/core/contexts';",
                '',
                'export function Field({ type }) {',
                "    const Html = useFieldComponent('html');",
                '    const Other = useFieldComponent(type);',
                '    return <><Html /><Other /></>;',
                '}',
                '',
            ].join('\n'),
        });
        expect(messages).toEqual([
            "Field.jsx:4 `useFieldComponent('html')`: the `richtext` field of `@panneau/editor` replaces it",
            'Field.jsx:5 `useFieldComponent()` with an id that is not a string: import the v5 component of the field',
        ]);
        expect(output('Field.jsx')).toContain(
            "import { useFieldComponent } from '@panneau/core/contexts';",
        );
    });

    it('reads the form value of `@panneau/forms`, and reports `useFormValue(path)`', () => {
        const { output, messages } = run({
            'Slug.jsx': [
                "import { useFormValue } from '@panneau/core/contexts';",
                '',
                'export function Slug() {',
                '    const values = useFormValue();',
                "    const title = useFormValue('title');",
                '    return <span>{values.slug}{title}</span>;',
                '}',
                '',
            ].join('\n'),
        });
        expect(output('Slug.jsx')).toContain(
            'const values = useFormState(useFormContext()).values;',
        );
        expect(output('Slug.jsx')).toContain(
            "import { useFormState, useFormContext } from '@panneau/forms';",
        );
        expect(messages).toEqual([
            'Slug.jsx:5 `useFormValue(path)`: `useFormContext().getValue(path)` of `@panneau/forms` reads a value of the form',
        ]);
    });

    it('renders the input of each locale with the children function of `LocalizedField`', () => {
        const { output, messages } = run({
            'Title.tsx': [
                "import LocalizedField from '@panneau/field-localized';",
                "import TextField from '@panneau/field-text';",
                "import Slug from './Slug';",
                '',
                'export function Title({ value, locales, ...props }: { value: any; locales: string[] }) {',
                '    return (',
                '        <>',
                '            <LocalizedField value={value} locales={locales} fieldComponent={TextField} />',
                '            <LocalizedField value={value} locales={locales} fieldComponent={Slug} />',
                '            <LocalizedField value={value} locales={locales} {...props} />',
                '        </>',
                '    );',
                '}',
                '',
            ].join('\n'),
        });
        expect(output('Title.tsx')).toContain('value={input.value as string | null}');
        expect(output('Title.tsx')).toContain('onBlur={input.onBlur}');
        // A component of the project gets the locale of its value, as v4 gave it.
        expect(output('Title.tsx')).toContain('fieldLocale={input.locale}');
        expect(messages).toEqual([
            'Title.tsx:10 `<LocalizedField>` has no `fieldComponent`: v4 rendered the `component` of the field (given by the spread props), `LocalizedField` of Panneau 5 renders the input of each locale with its children function: give it one',
        ]);
    });

    it('keeps the `className` of a field over the one of its `FormGroup`, and reports it', () => {
        const { output, messages } = run({
            'Group.jsx': [
                "import TextField from '@panneau/field-text';",
                "import FormGroup from '@panneau/element-form-group';",
                '',
                'export function Group({ value }) {',
                '    return (',
                '        <FormGroup label="Title" className="col-6" helpText="Shown on the page">',
                '            <TextField className="title" value={value} />',
                '        </FormGroup>',
                '    );',
                '}',
                '',
            ].join('\n'),
        });
        expect(output('Group.jsx')).toContain('label="Title"');
        expect(output('Group.jsx')).toContain('description="Shown on the page"');
        expect(output('Group.jsx')).not.toContain('</FormGroup>');
        expect(output('Group.jsx')).not.toContain('@panneau/element-form-group');
        expect(messages).toContain(
            'Group.jsx:6 `<FormGroup className>` is dropped: `<TextField>` has its own `className`',
        );
    });

    describe('without the container of the app', () => {
        it('takes the components of a `fields` folder that import Panneau as fields', () => {
            const { output } = run({
                'fields/Price.jsx': [
                    "import { useFormValue } from '@panneau/core/contexts';",
                    '',
                    'function PriceField(props) {',
                    '    const { value, onChange, currency } = props;',
                    '    return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={currency} />;',
                    '}',
                    '',
                    'export default PriceField;',
                    '',
                ].join('\n'),
                'site/fields/Search.jsx':
                    'export default function Search({ value, onChange }) {\n    return <input value={value} onChange={onChange} />;\n}\n',
                'components/Price.jsx':
                    'export default function Price({ value }) {\n    return <span>{value}</span>;\n}\n',
            });
            expect(output('fields/Price.jsx')).toContain(
                'export function PriceFieldEntry(props) {',
            );
            expect(output('fields/Price.jsx')).toContain(
                'currency={props.field.settings?.currency}',
            );
            // A component of the site in a `fields` folder doesn't import Panneau.
            expect(output('site/fields/Search.jsx')).toBeNull();
            expect(output('components/Price.jsx')).toBeNull();
        });

        it('reports a field it cannot read', () => {
            const { messages } = run({
                'fields/Memo.jsx':
                    "import { memo } from 'react';\nimport TextField from '@panneau/field-text';\n\nexport default memo(function Memo() {\n    return null;\n});\n",
            });
            expect(messages).toEqual([
                'fields/Memo.jsx:4 the default export is registered as a field, but it is not a function component the codemods can read: write its entry (`FieldEntryProps` of `@panneau/fields`)',
            ]);
        });
    });

    it('keeps `components` it cannot list, and reports them', () => {
        const { output, messages } = run({
            'Panneau.jsx': [
                "import Panneau from '@panneau/app';",
                "import { FIELDS_NAMESPACE } from '@panneau/core/contexts';",
                "import Price from './Price';",
                '',
                'export default function Container({ definition }) {',
                '    return <Panneau definition={definition} theme="dark" components={{ [FIELDS_NAMESPACE]: { Price } }} />;',
                '}',
                '',
            ].join('\n'),
        });
        expect(output('Panneau.jsx')).toContain('    fields: { Price },');
        expect(messages).toEqual([
            'Panneau.jsx:6 `fields` must be keyed by the types of the definition (`page-slug`), and give registry entries (`FieldEntryProps` of `@panneau/fields`)',
            'Panneau.jsx:6 `theme` of the app is dropped: Panneau 5 has no such option',
            'Panneau.jsx:6 the container is now the plugin of the project: `definition` come from the boot config of the page, and the rest of the container is dropped (it stays in git)',
        ]);
    });

    it('reports an entry of v5 whose plugins are not a list', () => {
        const { messages } = run({
            'Panneau.jsx':
                "import Panneau from '@panneau/app';\n\nexport default function Container() {\n    return <Panneau />;\n}\n",
            'panneau.ts':
                "import { createPanneauApp } from '@panneau/app';\n\ncreatePanneauApp({ element: document.body, plugins: getPlugins() });\n",
        });
        expect(messages).toContain(
            'panneau.ts:3 add the plugin of the project to the `plugins` of `createPanneauApp()`',
        );
    });
});
