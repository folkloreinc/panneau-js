import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { JsonField, type JsonValue, parseJson } from './JsonField';

describe('parseJson', () => {
    it('parses objects and arrays, and keeps other text as it is', () => {
        expect(parseJson('{"a":1}')).toEqual({ value: { a: 1 }, error: null });
        expect(parseJson('[1]')).toEqual({ value: [1], error: null });
        expect(parseJson('')).toEqual({ value: null, error: null });
        expect(parseJson('{"a":').value).toBe('{"a":');
        expect(parseJson('12').value).toBe('12');
    });
});

describe('JsonField', () => {
    it('keeps the text as typed, and the text itself while it does not parse', () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<JsonValue | null> initial={{ a: 1 }} onChange={onChange}>
                {(value, setValue) => <JsonField label="Data" value={value} onChange={setValue} />}
            </Controlled>,
        );
        const input = screen.getByRole('textbox', { name: 'Data' });
        expect(input).toHaveValue('{\n  "a": 1\n}');

        fireEvent.change(input, { target: { value: '{"a": 2' } });
        expect(onChange).toHaveBeenLastCalledWith('{"a": 2');
        expect(input).toHaveValue('{"a": 2');
        expect(screen.getByText(/This JSON doesn’t parse/)).toBeInTheDocument();

        fireEvent.change(input, { target: { value: '{"a": 2}' } });
        expect(onChange).toHaveBeenLastCalledWith({ a: 2 });
        // Not indented while typing
        expect(input).toHaveValue('{"a": 2}');
        fireEvent.blur(input);
        expect(input).toHaveValue('{\n  "a": 2\n}');
    });

    it('renders from a definition', () => {
        renderField(
            <DefinitionField
                field={{ name: 'data', type: 'json', label: 'Data' }}
                path="data"
                value={[1, 2]}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Data' })).toHaveValue('[\n  1,\n  2\n]');
    });
});
