import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { ColorField, normalizeColor } from './ColorField';
import { getColorPalette, getSwatchColor, toColorPalette } from './palette';

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

const PALETTE = [
    { value: 'purple', label: 'Purple', color: '#6b21a8' },
    { value: 'white', label: 'White', color: '#ffffff' },
    { value: '#f59e0b', label: 'Amber' },
];

describe('palettes', () => {
    it('keeps the entries with a value, and the hexadecimal colors of their swatches', () => {
        expect(
            toColorPalette([
                { value: 'purple', label: 'Purple', color: '#6b21a8' },
                { value: 'blue', color: 'blue' },
                { label: 'No value' },
                'red',
            ]),
        ).toEqual([{ value: 'purple', label: 'Purple', color: '#6b21a8' }, { value: 'blue' }]);
        expect(toColorPalette([])).toBeNull();
        expect(getColorPalette({ name: 'accent', type: 'color' })).toBeNull();
        expect(getSwatchColor({ value: 'purple', color: '#6b21a8' })).toBe('#6b21a8');
        expect(getSwatchColor({ value: '#f59e0b' })).toBe('#f59e0b');
        expect(getSwatchColor({ value: 'blue' })).toBeNull();
    });
});

describe('ColorField with a palette', () => {
    it('only offers the colors of its palette, with their swatches', async () => {
        const onChange = vi.fn();
        renderField(
            <ColorField label="Background" palette={PALETTE} value={null} onChange={onChange} />,
        );
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /Background/ }));
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
            'Pick a color',
            'Purple',
            'White',
            'Amber',
        ]);
        await userEvent.click(screen.getByRole('option', { name: 'Purple' }));
        expect(onChange).toHaveBeenLastCalledWith('purple');
    });

    it('can be emptied unless it is required', async () => {
        const onChange = vi.fn();
        const { unmount } = renderField(
            <ColorField label="Background" palette={PALETTE} value="white" onChange={onChange} />,
        );
        await userEvent.click(screen.getByRole('button', { name: /Background/ }));
        await userEvent.click(screen.getByRole('option', { name: 'Pick a color' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
        unmount();
        renderField(<ColorField required label="Background" palette={PALETTE} value="white" />);
        await userEvent.click(screen.getByRole('button', { name: /Background/ }));
        expect(screen.queryByRole('option', { name: 'Pick a color' })).not.toBeInTheDocument();
    });

    it('shows a value outside its palette as it is', () => {
        renderField(<ColorField label="Background" palette={PALETTE} value="teal" />);
        expect(screen.getByRole('button', { name: /Background/ })).toHaveTextContent('teal');
    });

    it('renders from a definition with settings.palette', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'background',
                    type: 'color',
                    label: 'Background',
                    settings: { palette: PALETTE },
                }}
                path="background"
                value="#f59e0b"
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('button', { name: /Background/ })).toHaveTextContent('Amber');
    });
});
