import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { BooleanField } from './BooleanField';

describe('BooleanField', () => {
    it('is a checkbox with its label', async () => {
        const onChange = vi.fn();
        renderField(<BooleanField label="Members only" value={null} onChange={onChange} />);
        await userEvent.click(screen.getByRole('checkbox', { name: 'Members only' }));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('is a switch with the switch widget', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'comments',
                    type: 'boolean',
                    label: 'Comments',
                    settings: { widget: 'switch' },
                }}
                path="comments"
                value
                onChange={onChange}
            />,
        );
        const toggle = screen.getByRole('switch', { name: 'Comments' });
        expect(toggle).toBeChecked();
        await userEvent.click(toggle);
        expect(onChange).toHaveBeenCalledWith(false);
    });
});
