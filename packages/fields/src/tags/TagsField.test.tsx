import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';

const field = {
    name: 'topics',
    type: 'tags',
    label: 'Topics',
    options: [
        { value: 'culture', label: 'Culture' },
        { value: 'food', label: 'Food' },
    ],
};

describe('TagsField', () => {
    it('adds typed tags, matches options, and removes with Backspace', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<unknown> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <DefinitionField
                        field={field}
                        path="topics"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        const input = screen.getByRole('combobox', { name: 'Topics' });
        await userEvent.type(input, 'Food{Enter}montréal,  food ,');
        expect(onChange).toHaveBeenLastCalledWith(['food', 'montréal']);
        const tags = screen.getByRole('grid', { name: 'Tags: Topics' });
        expect(
            within(tags)
                .getAllByRole('row')
                .map((row) => row.textContent),
        ).toEqual(['Food', 'montréal']);
        await userEvent.keyboard('{Backspace}');
        expect(onChange).toHaveBeenLastCalledWith(['food']);
        await userEvent.click(within(tags).getByRole('button', { name: /Remove/ }));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('only adds options without allowCustom', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<unknown> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <DefinitionField
                        field={{ ...field, settings: { allowCustom: false } }}
                        path="topics"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        await userEvent.type(
            screen.getByRole('combobox', { name: 'Topics' }),
            'sports{Enter}culture{Enter}',
        );
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(['culture']);
    });
});
