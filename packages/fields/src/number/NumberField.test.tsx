import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { NumberField } from './NumberField';

describe('NumberField', () => {
    it('gives numbers', async () => {
        const onChange = vi.fn();
        renderField(<NumberField label="Duration" value={null} onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox', { name: 'Duration' }), '42');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(42);
    });

    it('clamps to the min and max of its rules', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'rating',
                    type: 'number',
                    label: 'Rating',
                    rules: [
                        { rule: 'min', value: 1 },
                        { rule: 'max', value: 5 },
                    ],
                    settings: { suffix: 'stars' },
                }}
                path="rating"
                value={null}
                onChange={onChange}
            />,
        );
        await userEvent.type(screen.getByRole('textbox', { name: 'Rating' }), '9');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(5);
        expect(screen.getByText('stars')).toBeInTheDocument();
    });

    it('ignores values that are not numbers', () => {
        renderField(
            <DefinitionField
                field={{ name: 'n', type: 'number', label: 'N' }}
                path="n"
                value="abc"
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'N' })).toHaveValue('');
    });
});
