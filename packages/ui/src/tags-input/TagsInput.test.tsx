import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { TagsInput } from './TagsInput';

function Tags({ onChange }: { onChange: (value: string[] | null) => void }) {
    const [value, setValue] = useState<string[] | null>(['one']);
    return (
        <PanneauRoot>
            <TagsInput
                label="Tags"
                value={value}
                onChange={(next) => {
                    setValue(next);
                    onChange(next);
                }}
            />
        </PanneauRoot>
    );
}

describe('TagsInput', () => {
    it('adds pasted lists, once each', async () => {
        const onChange = vi.fn();
        render(<Tags onChange={onChange} />);
        await userEvent.click(screen.getByRole('textbox', { name: 'Tags' }));
        await userEvent.paste('two, one\nthree');
        expect(onChange).toHaveBeenLastCalledWith(['one', 'two', 'three']);
    });

    it('adds what is typed when it loses focus', async () => {
        const onChange = vi.fn();
        render(<Tags onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox', { name: 'Tags' }), 'two');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(['one', 'two']);
    });
});
