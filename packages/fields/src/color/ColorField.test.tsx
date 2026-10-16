import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { ColorField, normalizeColor } from './ColorField';

describe('normalizeColor', () => {
    it('normalizes hexadecimal colors', () => {
        expect(normalizeColor('ABC')).toBe('#aabbcc');
        expect(normalizeColor(' #1D4ED8 ')).toBe('#1d4ed8');
        expect(normalizeColor('red')).toBe('red');
    });
});

describe('ColorField', () => {
    it('normalizes on blur', async () => {
        const onChange = vi.fn();
        renderField(<ColorField label="Accent" value="F00" onChange={onChange} />);
        await userEvent.click(screen.getByRole('textbox', { name: 'Accent' }));
        await userEvent.tab();
        expect(onChange).toHaveBeenCalledWith('#ff0000');
    });

    it('picks a color with the browser picker', () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{ name: 'accent', type: 'color', label: 'Accent' }}
                path="accent"
                value="#000000"
                onChange={onChange}
            />,
        );
        fireEvent.change(screen.getByLabelText('Pick a color'), { target: { value: '#123456' } });
        expect(onChange).toHaveBeenCalledWith('#123456');
    });
});
