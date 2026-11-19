import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold, Italic, Link2 } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { IconButton } from '../icon-button/IconButton';
import { TextArea, type TextAreaProps } from './TextArea';

const meta = {
    title: 'UI/TextArea',
    component: TextArea,
    args: { label: 'Summary', description: 'One or two sentences.' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const textArea = within(canvasElement).getByRole('textbox', { name: 'Summary' });
        await expect(getComputedStyle(textArea).paddingLeft).toBe('12px');
        // The wrapper has the root class only, not the padding of the textarea (#72).
        const wrapper = textArea.closest('.panneau-text-area') as Element;
        await expect(wrapper).not.toBe(textArea);
        await expect(getComputedStyle(wrapper).paddingLeft).toBe('0px');
    },
};

export const WithErrors: Story = { args: { errors: ['This value must be at most 280.'] } };

const LIMIT = 280;

function CountedTextArea(props: TextAreaProps) {
    const [value, setValue] = useState('');
    return (
        <TextArea
            {...props}
            value={value}
            onChange={setValue}
            header={
                <>
                    <IconButton icon={Bold} label="Bold" size="sm" />
                    <IconButton icon={Italic} label="Italic" size="sm" />
                    <IconButton icon={Link2} label="Insert a link" size="sm" />
                </>
            }
            footer={
                <span aria-live="polite" style={{ marginInlineStart: 'auto' }}>
                    {value.length}/{LIMIT}
                </span>
            }
            errors={value.length > LIMIT ? [`This value must be at most ${LIMIT}.`] : []}
        />
    );
}

/** Small buttons in the header, and a character count in the footer, inside the box. */
export const WithHeaderAndFooter: Story = {
    render: (args) => <CountedTextArea {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const textArea = canvas.getByRole('textbox', { name: 'Summary' });
        await userEvent.type(textArea, 'Hello');
        await expect(canvas.getByText('5/280')).toBeInTheDocument();
        const box = textArea.parentElement as Element;
        await expect(box).toContainElement(canvas.getByRole('button', { name: 'Bold' }));
        await expect(getComputedStyle(box).boxShadow).not.toBe('none');
    },
};
