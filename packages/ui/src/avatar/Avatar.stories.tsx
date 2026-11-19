import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Badge } from '../badge/Badge';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';

const meta = {
    title: 'UI/Avatar',
    component: Avatar,
    args: { name: 'Ada Lovelace' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAMES = [
    'Ada Lovelace',
    'Grace Hopper',
    'Alan Turing',
    'Margaret Hamilton',
    'Édouard Lucas',
    'Barbara Liskov',
    'Katherine Johnson',
    'Linus Torvalds',
];

const PICTURE =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#7c9cbf"/><circle cx="20" cy="16" r="7" fill="#e8eef5"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13z" fill="#e8eef5"/></svg>',
    );

/** Initials on a tint of a chart color picked from the name: the same person, the same color. */
export const Initials: Story = {
    render: () => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {NAMES.map((name) => (
                <Avatar key={name} name={name} label={name} />
            ))}
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
        await expect(canvas.getByRole('img', { name: 'Édouard Lucas' })).toHaveTextContent('ÉL');
    },
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <Avatar key={size} {...args} size={size} />
            ))}
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <Avatar key={`picture-${size}`} {...args} size={size} src={PICTURE} />
            ))}
        </div>
    ),
};

/** A picture that fails to load shows the initials. */
export const BrokenPicture: Story = {
    args: { src: '/missing-avatar.jpg', label: 'Ada Lovelace' },
    play: async ({ canvasElement }) => {
        const avatar = within(canvasElement).getByRole('img', { name: 'Ada Lovelace' });
        await expect(avatar).toHaveTextContent('AL');
        await expect(avatar.querySelector('img')).toBeNull();
    },
};

/**
 * A state in a tone: a ring around the avatar, with the state in words, in the label or next to
 * it.
 */
export const States: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Avatar name="Ada Lovelace" label="Ada Lovelace" tone="neutral" status="Disabled" />
                <Avatar
                    name="Grace Hopper"
                    label="Grace Hopper"
                    tone="warning"
                    status="Over quota"
                    src={PICTURE}
                />
                <Avatar name="Alan Turing" label="Alan Turing" tone="danger" status="Blocked" />
                <Avatar
                    name="Margaret Hamilton"
                    label="Margaret Hamilton"
                    tone="success"
                    status="Online"
                    size="lg"
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Avatar name="Ada Lovelace" size="sm" tone="neutral" />
                <span>Ada Lovelace</span>
                <Badge tone="neutral">Disabled</Badge>
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('img', { name: 'Ada Lovelace (Disabled)' }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole('img', { name: 'Alan Turing (Blocked)' })).toHaveAttribute(
            'title',
            'Alan Turing (Blocked)',
        );
    },
};

export const Group: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AvatarGroup people={NAMES.map((name) => ({ name }))} />
            <AvatarGroup
                size="md"
                max={4}
                people={[
                    { name: 'Ada Lovelace', src: PICTURE },
                    { name: 'Grace Hopper', tone: 'warning', status: 'Over quota' },
                    { name: 'Alan Turing' },
                    { name: 'Margaret Hamilton' },
                ]}
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('img', {
                name: 'Ada Lovelace, Grace Hopper, Alan Turing, and 5 others',
            }),
        ).toHaveTextContent('+5');
        await expect(
            canvas.getByRole('img', {
                name: 'Ada Lovelace, Grace Hopper (Over quota), Alan Turing, and Margaret Hamilton',
            }),
        ).toBeInTheDocument();
    },
};
