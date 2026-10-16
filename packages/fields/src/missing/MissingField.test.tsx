import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';

describe('MissingFieldEntry', () => {
    it('keeps the place of a type without a plugin', () => {
        renderField(
            <DefinitionField
                field={{ name: 'body', type: 'richtext', label: 'Body' }}
                path="body"
                value="<p>Hi</p>"
                onChange={() => undefined}
            />,
        );
        expect(screen.getByText('Body')).toBeInTheDocument();
        expect(screen.getByRole('note')).toHaveTextContent(
            'This field needs a plugin for the “richtext” type.',
        );
    });

    it('is replaced by a plugin entry for the type', () => {
        renderField(
            <DefinitionField
                field={{ name: 'body', type: 'richtext', label: 'Body' }}
                path="body"
                value="<p>Hi</p>"
                onChange={() => undefined}
            />,
            { components: { richtext: ({ field }) => <p>Editor for {field.name}</p> } },
        );
        expect(screen.getByText('Editor for body')).toBeInTheDocument();
    });
});
