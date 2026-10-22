import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutGrid, List } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { SegmentedControl } from './SegmentedControl';

const archive = { value: 'archive', label: 'Archive', isDisabled: true };
const libraries = [
    { value: 'images', label: 'Images' },
    { value: 'documents', label: 'Documents' },
    archive,
];

describe('SegmentedControl', () => {
    it('is a group of radios, controlled, with one always selected', async () => {
        const onChange = vi.fn();
        render(
            <SegmentedControl
                aria-label="Library"
                options={libraries}
                value="images"
                onChange={onChange}
            />,
        );
        expect(screen.getByRole('radiogroup', { name: 'Library' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Images' })).toBeChecked();
        await userEvent.click(screen.getByRole('radio', { name: 'Documents' }));
        expect(onChange).toHaveBeenCalledWith('documents');
        // Controlled: the selection follows `value`, which didn't change.
        expect(screen.getByRole('radio', { name: 'Images' })).toBeChecked();
        // Clicking the selected one doesn't empty the selection.
        onChange.mockClear();
        await userEvent.click(screen.getByRole('radio', { name: 'Images' }));
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('radio', { name: 'Archive' })).toBeDisabled();
    });

    it('selects the first enabled option when uncontrolled, and moves with the arrows', async () => {
        const onChange = vi.fn();
        render(
            <SegmentedControl
                aria-label="Library"
                options={[archive, ...libraries.slice(0, 2)]}
                onChange={onChange}
            />,
        );
        const images = screen.getByRole('radio', { name: 'Images' });
        expect(images).toBeChecked();
        await userEvent.tab();
        expect(images).toHaveFocus();
        await userEvent.keyboard('{ArrowRight}');
        expect(screen.getByRole('radio', { name: 'Documents' })).toHaveFocus();
    });

    it('names icon-only segments with their text value', () => {
        render(
            <SegmentedControl
                aria-label="View"
                options={[
                    { value: 'grid', label: null, icon: LayoutGrid, textValue: 'Grid' },
                    { value: 'list', label: null, icon: List, textValue: 'List' },
                ]}
                defaultValue="list"
            />,
        );
        expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Grid' })).not.toBeChecked();
    });
});
