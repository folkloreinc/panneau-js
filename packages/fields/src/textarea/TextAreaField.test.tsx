import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TextAreaField } from './TextAreaField';

describe('TextAreaField', () => {
    it('changes, and empty is null', async () => {
        const onChange = vi.fn();
        renderField(<TextAreaField label="Summary" value="a" onChange={onChange} />);
        await userEvent.clear(screen.getByRole('textbox'));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('renders from a definition, with rows and a count', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'summary',
                    type: 'textarea',
                    label: 'Summary',
                    rules: [{ rule: 'max', value: 280 }],
                    settings: { rows: 8 },
                }}
                path="summary"
                value="abc"
                onChange={() => undefined}
            />,
        );
        const textarea = screen.getByRole('textbox', { name: 'Summary' });
        expect(textarea).toHaveAttribute('rows', '8');
        expect(textarea).toHaveAccessibleDescription('3 / 280 characters');
    });
});
