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
});
