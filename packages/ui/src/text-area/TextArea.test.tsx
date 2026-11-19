import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TextArea } from './TextArea';

describe('TextArea', () => {
    it('is a labelled multi-line input', async () => {
        const onChange = vi.fn();
        render(<TextArea label="Summary" rows={6} onChange={onChange} />);
        const textarea = screen.getByRole('textbox', { name: 'Summary' });
        expect(textarea.tagName).toBe('TEXTAREA');
        expect(textarea).toHaveAttribute('rows', '6');
        await userEvent.type(textarea, 'a{Enter}b');
        expect(onChange).toHaveBeenLastCalledWith('a\nb');
    });

    it('shows its errors', () => {
        render(<TextArea label="Summary" errors={['Too long.']} />);
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('Too long.')).toBeInTheDocument();
    });

    it('draws a header and a footer inside its box', async () => {
        const onChange = vi.fn();
        render(
            <TextArea
                label="Summary"
                header="Markdown"
                footer={<button type="button">Insert a link</button>}
                onChange={onChange}
                controlClassName="custom"
            />,
        );
        const textarea = screen.getByRole('textbox', { name: 'Summary' });
        const box = textarea.closest('.custom');
        expect(box).toBe(textarea.parentElement);
        expect(box).toHaveTextContent('Markdown');
        expect(box).toContainElement(screen.getByRole('button', { name: 'Insert a link' }));
        await userEvent.type(textarea, 'Hello');
        expect(onChange).toHaveBeenLastCalledWith('Hello');
    });

    it('marks its box invalid with errors', () => {
        render(<TextArea label="Summary" footer="0/280" errors={['Too long.']} />);
        expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-invalid', 'true');
    });
});
