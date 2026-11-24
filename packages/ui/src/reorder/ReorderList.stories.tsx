import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { TextArea } from '../text-area/TextArea';
import { TextInput } from '../text-input/TextInput';
import { ReorderHandle, ReorderItem, ReorderList } from './ReorderList';

interface Block {
    id: number;
    title: string;
    body: string;
}

const BLOCKS: readonly Block[] = [
    { id: 1, title: 'Introduction', body: 'Why the park opens again.' },
    { id: 2, title: 'Quote', body: 'A word from the mayor.' },
    { id: 3, title: 'Gallery', body: 'Photos of the opening.' },
    { id: 4, title: 'Credits', body: 'Who wrote this.' },
];

function moved<T>(items: readonly T[], from: number, to: number): T[] {
    const next = [...items];
    const [item] = next.splice(from, 1);
    if (item !== undefined) {
        next.splice(to, 0, item);
    }
    return next;
}

/** Blocks with fields, reordered by their handles. */
function Blocks({ count = BLOCKS.length, isDisabled }: { count?: number; isDisabled?: boolean }) {
    const [blocks, setBlocks] = useState(() => BLOCKS.slice(0, count));
    const update = (index: number, patch: Partial<Block>) =>
        setBlocks(blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)));
    return (
        <ReorderList
            aria-label="Blocks"
            itemCount={blocks.length}
            itemLabel={(index) => blocks[index]?.title ?? ''}
            onMove={(from, to) => setBlocks(moved(blocks, from, to))}
            {...(isDisabled !== undefined ? { isDisabled } : {})}
            style={{ display: 'grid', gap: 12, padding: 0, margin: 0, listStyle: 'none' }}
        >
            {blocks.map((block, index) => (
                <ReorderItem
                    key={block.id}
                    id={block.id}
                    index={index}
                    data-testid={`block-${block.id}`}
                    style={{
                        display: 'grid',
                        gap: 8,
                        padding: 12,
                        border: '1px solid var(--panneau-color-border)',
                        borderRadius: 'var(--panneau-radius-md)',
                        background: 'var(--panneau-color-surface)',
                    }}
                >
                    <div
                        data-reorder-preview
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        <ReorderHandle />
                        <strong>{block.title}</strong>
                    </div>
                    <TextInput
                        label={`Title of block ${block.id}`}
                        value={block.title}
                        onChange={(title) => update(index, { title })}
                    />
                    <TextArea
                        label={`Text of block ${block.id}`}
                        rows={2}
                        value={block.body}
                        onChange={(body) => update(index, { body })}
                    />
                </ReorderItem>
            ))}
        </ReorderList>
    );
}

const meta = {
    title: 'UI/ReorderList',
    component: Blocks,
} satisfies Meta<typeof Blocks>;

export default meta;
type Story = StoryObj<typeof meta>;

const order = (canvasElement: HTMLElement) =>
    [...canvasElement.querySelectorAll<HTMLElement>('[data-reorder-item]')].map(
        (item) => item.dataset.reorderId,
    );

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Drags an element to a point with the events of the browser's drag and drop, as a mouse does.
 * Test drivers can't start a native drag in the frame of a story, so the events are dispatched.
 */
async function drag(source: HTMLElement, target: HTMLElement, clientY: number) {
    const dataTransfer = new DataTransfer();
    // Outside of a real drag, a browser keeps the effects at "none": keep what is set, as in one
    const effects = { effectAllowed: 'uninitialized', dropEffect: 'none' };
    for (const name of ['effectAllowed', 'dropEffect'] as const) {
        Object.defineProperty(dataTransfer, name, {
            get: () => effects[name],
            set: (value: string) => {
                effects[name] = value;
            },
        });
    }
    const start = source.getBoundingClientRect();
    const clientX = start.x + start.width / 2;
    const fire = (element: Element, type: string, y: number) =>
        element.dispatchEvent(
            new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                dataTransfer,
                clientX,
                clientY: y,
            }),
        );
    fire(source, 'dragstart', start.y + start.height / 2);
    await nextFrame();
    fire(target, 'dragenter', clientY);
    fire(target, 'dragover', clientY);
    await nextFrame();
    fire(target, 'drop', clientY);
    fire(source, 'dragend', clientY);
}

/**
 * The handle drags its block. With the pointer, the block goes where it is dropped, before or after
 * the block under it. Its fields keep their values, and a status message says where it went.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole('textbox', { name: 'Title of block 1' }), ' text');
        const handle = canvas.getByRole('button', { name: 'Move Introduction text' });
        // Dropped on the lower half of the third block: after it
        const third = canvas.getByTestId('block-3');
        const rect = third.getBoundingClientRect();
        await drag(handle, third, rect.bottom - 4);
        await waitFor(() => expect(order(canvasElement)).toEqual(['2', '3', '1', '4']));
        await expect(canvas.getByRole('status')).toHaveTextContent(
            'Introduction text moved to position 3 of 4',
        );
        await expect(canvas.getByRole('textbox', { name: 'Title of block 1' })).toHaveValue(
            'Introduction text',
        );
        // Once the blocks slid to their places, dropped on the upper half of the first block
        await Promise.all(document.getAnimations().map((animation) => animation.finished));
        const first = canvas.getByTestId('block-2');
        await drag(
            canvas.getByRole('button', { name: 'Move Credits' }),
            first,
            first.getBoundingClientRect().top + 4,
        );
        await waitFor(() => expect(order(canvasElement)).toEqual(['4', '2', '3', '1']));
    },
};

/**
 * With the keyboard, Enter or Space picks a block up: the places it can go are drop targets, which
 * Tab or the arrows go through, and Enter or Space drops it. Escape puts it back. The focus goes
 * back to its handle, at its new place.
 */
export const Keyboard: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const handle = canvas.getByRole('button', { name: 'Move Credits' });
        handle.focus();
        await userEvent.keyboard('{Enter}');
        // The nearest place first: before the last block
        await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Before Gallery'));
        await userEvent.keyboard('{ArrowUp}');
        await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Before Quote'));
        await userEvent.keyboard('{ArrowUp}');
        await waitFor(() =>
            expect(document.activeElement).toHaveAccessibleName('Before Introduction'),
        );
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(order(canvasElement)).toEqual(['4', '1', '2', '3']));
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Move Credits' })).toHaveFocus(),
        );
        await expect(canvas.getByRole('status')).toHaveTextContent(
            'Credits moved to position 1 of 4',
        );

        // Space picks it up and drops it too; Tab goes to the next place
        await userEvent.keyboard(' ');
        await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Before Quote'));
        await userEvent.keyboard(' ');
        await waitFor(() => expect(order(canvasElement)).toEqual(['1', '4', '2', '3']));

        // Escape puts it back, with the focus on its handle
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Move Credits' })).toHaveFocus(),
        );
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Move Credits' })).toHaveFocus(),
        );
        await expect(order(canvasElement)).toEqual(['1', '4', '2', '3']);
    },
};

/** Only the handle drags: the text of a block can be selected and edited, and keeps the focus. */
export const TextStaysSelectable: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const text = canvas.getByRole('textbox', { name: 'Text of block 2' });
        await userEvent.pointer([
            { target: text, offset: 0, keys: '[MouseLeft>]' },
            { offset: 4 },
            { keys: '[/MouseLeft]' },
        ]);
        await expect(text).toHaveFocus();
        await expect([
            (text as HTMLTextAreaElement).selectionStart,
            (text as HTMLTextAreaElement).selectionEnd,
        ]).toEqual([0, 4]);
        await expect(canvas.getByText('Quote', { selector: 'strong' }).closest('[draggable]')).toBe(
            null,
        );
        await expect(canvas.getByRole('button', { name: 'Move Quote' })).toHaveAttribute(
            'draggable',
            'true',
        );
    },
};

/** A list of one item, or a disabled list, can't be reordered: its handles are disabled. */
export const SingleItem: Story = {
    args: { count: 1 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const handle = canvas.getByRole('button', { name: 'Move Introduction' });
        await expect(handle).toHaveAttribute('aria-disabled', 'true');
        await expect(handle).not.toHaveAttribute('draggable', 'true');
    },
};

export const Disabled: Story = { args: { isDisabled: true } };

interface Section {
    id: string;
    items: string[];
}

const SECTIONS: readonly Section[] = [
    { id: 'Morning', items: ['Coffee', 'News'] },
    { id: 'Noon', items: ['Lunch', 'Walk', 'Nap'] },
];

/** Sections, each with a list of its own inside: an item of one list doesn't go in another. */
function Sections() {
    const [sections, setSections] = useState(SECTIONS);
    const box = {
        display: 'grid',
        gap: 8,
        padding: 8,
        border: '1px solid var(--panneau-color-border)',
        borderRadius: 'var(--panneau-radius-md)',
    };
    const list = { display: 'grid', gap: 8, padding: 0, margin: 0, listStyle: 'none' };
    return (
        <ReorderList
            aria-label="Sections"
            itemCount={sections.length}
            itemLabel={(index) => sections[index]?.id ?? ''}
            onMove={(from, to) => setSections(moved(sections, from, to))}
            style={list}
        >
            {sections.map((section, index) => (
                <ReorderItem key={section.id} id={section.id} index={index} style={box}>
                    <div data-reorder-preview style={{ display: 'flex', alignItems: 'center' }}>
                        <ReorderHandle />
                        <strong>{section.id}</strong>
                    </div>
                    <ReorderList
                        aria-label={`Items of ${section.id}`}
                        itemCount={section.items.length}
                        itemLabel={(item) => section.items[item] ?? ''}
                        onMove={(from, to) =>
                            setSections(
                                sections.map((current) =>
                                    current === section
                                        ? { ...current, items: moved(current.items, from, to) }
                                        : current,
                                ),
                            )
                        }
                        style={list}
                    >
                        {section.items.map((item, itemIndex) => (
                            <ReorderItem
                                key={item}
                                id={item}
                                index={itemIndex}
                                data-testid={`item-${item}`}
                                style={{ ...box, display: 'flex', alignItems: 'center' }}
                            >
                                <ReorderHandle />
                                {item}
                            </ReorderItem>
                        ))}
                    </ReorderList>
                </ReorderItem>
            ))}
        </ReorderList>
    );
}

const orderIn = (list: HTMLElement) =>
    [...list.querySelectorAll<HTMLElement>(':scope > [data-reorder-item]')].map(
        (item) => item.dataset.reorderId,
    );

/**
 * A list inside the items of another one. A section drags over the list inside another section,
 * and goes before or after that section; an item of an inner list moves within its list only.
 */
export const Nested: Story = {
    render: () => <Sections />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const outer = canvas.getByRole('list', { name: 'Sections' });
        // Dropped over the inner list of Noon, on its lower half: after Noon
        const nap = canvas.getByTestId('item-Nap');
        await drag(
            canvas.getByRole('button', { name: 'Move Morning' }),
            nap,
            nap.getBoundingClientRect().bottom - 2,
        );
        await waitFor(() => expect(orderIn(outer)).toEqual(['Noon', 'Morning']));
        await Promise.all(document.getAnimations().map((animation) => animation.finished));

        // An item of an inner list moves in its list, and the sections stay
        const walk = canvas.getByTestId('item-Walk');
        await drag(
            canvas.getByRole('button', { name: 'Move Nap' }),
            walk,
            walk.getBoundingClientRect().top + 2,
        );
        const noon = canvas.getByRole('list', { name: 'Items of Noon' });
        await waitFor(() => expect(orderIn(noon)).toEqual(['Lunch', 'Nap', 'Walk']));
        await expect(orderIn(outer)).toEqual(['Noon', 'Morning']);
        await Promise.all(document.getAnimations().map((animation) => animation.finished));

        // With the keyboard, the places of a section are the sections'
        canvas.getByRole('button', { name: 'Move Morning' }).focus();
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Before Noon'));
        await expect(
            [...canvasElement.querySelectorAll('[data-reorder-gap]')].map((gap) =>
                gap.getAttribute('aria-label'),
            ),
        ).toEqual(['Before Noon']);
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(orderIn(outer)).toEqual(['Morning', 'Noon']));
    },
};
