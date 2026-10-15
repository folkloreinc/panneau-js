import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TimeField } from './TimeField';

describe('TimeField', () => {
    it('shows and gives HH:mm', async () => {
        const onChange = vi.fn();
        renderField(
            <TimeField label="Opens at" hourCycle={24} value="09:30" onChange={onChange} />,
        );
        const spinbuttons = within(screen.getByRole('group', { name: 'Opens at' })).getAllByRole(
            'spinbutton',
        );
        expect(spinbuttons.map((segment) => segment.textContent)).toEqual(['09', '30']);
        await userEvent.click(spinbuttons[1] as HTMLElement);
        await userEvent.keyboard('{ArrowUp}');
        expect(onChange).toHaveBeenLastCalledWith('09:31');
    });

    it('writes seconds with withSeconds', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{ name: 't', type: 'time', label: 'T', settings: { withSeconds: true } }}
                path="t"
                value="09:30:15"
                onChange={onChange}
            />,
        );
        const spinbuttons = within(screen.getByRole('group', { name: 'T' })).getAllByRole(
            'spinbutton',
        );
        await userEvent.click(spinbuttons[2] as HTMLElement);
        await userEvent.keyboard('{ArrowUp}');
        expect(onChange).toHaveBeenLastCalledWith('09:30:16');
    });
});
