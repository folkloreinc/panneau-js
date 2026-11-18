import { screen, within } from '@testing-library/react';
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

    it('picks a number on a scale, with what its ends mean', async () => {
        const onChange = vi.fn();
        renderField(
            <NumberField
                label="How useful is it?"
                widget="scale"
                minLabel="Not at all"
                maxLabel="Very"
                value={null}
                onChange={onChange}
            />,
        );
        const group = screen.getByRole('radiogroup', { name: 'How useful is it?' });
        const radios = within(group).getAllByRole('radio');
        expect(radios).toHaveLength(5);
        expect(radios.every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
        expect(within(group).getByRole('radio', { name: '1, Not at all' })).toBeInTheDocument();
        await userEvent.click(within(group).getByRole('radio', { name: '5, Very' }));
        expect(onChange).toHaveBeenLastCalledWith(5);
    });

    it('takes its scale from the definition', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'score',
                    type: 'number',
                    label: 'Score',
                    rules: [
                        { rule: 'min', value: 0 },
                        { rule: 'max', value: 10 },
                    ],
                    settings: { widget: 'scale', minLabel: 'Never', maxLabel: 'Always' },
                }}
                path="score"
                value={7}
                onChange={() => undefined}
            />,
        );
        const group = screen.getByRole('radiogroup', { name: 'Score' });
        expect(within(group).getAllByRole('radio')).toHaveLength(11);
        expect(within(group).getByRole('radio', { name: '7' })).toBeChecked();
    });

    it('is a field to type in when a scale would have too many buttons', () => {
        renderField(<NumberField label="Year" widget="scale" min={1900} max={2100} value={null} />);
        expect(screen.getByRole('textbox', { name: 'Year' })).toBeInTheDocument();
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
