import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Prose } from './Prose';

const meta = {
    title: 'UI/Prose',
    component: Prose,
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rich content, as an editor or Markdown writes it. */
export const RichContent: Story = {
    render: () => (
        <div style={{ display: 'grid', gap: '2rem', maxWidth: '40rem' }}>
            <Prose as="article" aria-label="Help">
                <h1>Publishing a page</h1>
                <p>
                    A page is visible on the site once it is <strong>published</strong>. Read the{' '}
                    <a href="#guide">editorial guide</a> before you publish, and check the{' '}
                    <code>slug</code>.
                </p>
                <h2>Before you publish</h2>
                <ul>
                    <li>Add a title and a summary.</li>
                    <li>
                        Choose an image:
                        <ol>
                            <li>at least 1200 pixels wide;</li>
                            <li>with a description.</li>
                        </ol>
                    </li>
                </ul>
                <blockquote>
                    <p>Write for the reader, not for the search engine.</p>
                </blockquote>
                <h3>Statuses</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Pages</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Published</td>
                            <td>1,204</td>
                        </tr>
                        <tr>
                            <td>Draft</td>
                            <td>87</td>
                        </tr>
                    </tbody>
                </table>
                <pre>
                    <code>{'<Prose>{html}</Prose>'}</code>
                </pre>
                <hr />
                <p>Last updated today.</p>
            </Prose>
            <div>
                <h2>Outside of Prose</h2>
                <ul>
                    <li>Panneau styles no element outside of it.</li>
                </ul>
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const title = canvas.getByRole('heading', { name: 'Publishing a page' });
        await expect(getComputedStyle(title).fontSize).toBe('28px');
        const list = canvas.getByText('Add a title and a summary.').closest('ul');
        await expect(getComputedStyle(list as Element).paddingInlineStart).toBe('21px');
        // Outside of Prose, lists keep the reset of the root.
        const outside = canvas.getByText('Panneau styles no element outside of it.').closest('ul');
        await expect(getComputedStyle(outside as Element).paddingInlineStart).toBe('0px');
    },
};
