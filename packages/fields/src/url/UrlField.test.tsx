import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { UrlField, withScheme } from './UrlField';

describe('withScheme', () => {
    it('adds a scheme to bare domains only', () => {
        expect(withScheme('example.com')).toBe('https://example.com');
        expect(withScheme('//example.com')).toBe('https://example.com');
        expect(withScheme('http://example.com')).toBe('http://example.com');
        expect(withScheme('mailto:ada@example.com')).toBe('mailto:ada@example.com');
        expect(withScheme('/about')).toBe('/about');
        expect(withScheme('#top')).toBe('#top');
        expect(withScheme(' ')).toBe('');
    });
});

describe('UrlField', () => {
    it('adds https:// on blur, and links to the URL', async () => {
        const onChange = vi.fn();
        renderField(<UrlField label="Website" value="example.com" onChange={onChange} />);
        const input = screen.getByRole('textbox', { name: 'Website' });
        expect(input).toHaveAttribute('type', 'url');
        await userEvent.click(input);
        await userEvent.tab();
        expect(onChange).toHaveBeenCalledWith('https://example.com');
    });

    it('links to a full URL', () => {
        renderField(
            <DefinitionField
                field={{ name: 'site', type: 'url', label: 'Website' }}
                path="site"
                value="https://example.com"
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('link', { name: 'Open the link' })).toHaveAttribute(
            'href',
            'https://example.com',
        );
    });
});
