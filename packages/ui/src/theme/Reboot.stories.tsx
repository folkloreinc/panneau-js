import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { Divider } from '../divider/Divider';
import { Fieldset } from '../field/Fieldset';
import { Stack } from '../stack/Stack';
import { TextInput } from '../text-input/TextInput';

/**
 * Panneau inside a page that loads Bootstrap's CSS: its Reboot styles elements globally
 * (`h5 { margin-bottom: 0.5rem }`, `p { margin-bottom: 1rem }`, floated legends, faded rules).
 * Components and the reset of the root must not inherit any of it.
 */
function RebootCheck() {
    return (
        <Stack gap={4} style={{ maxWidth: '32rem' }}>
            <Card title="A level 5 title" headingLevel={5}>
                Body
            </Card>
            <Fieldset legend="Contact">
                <TextInput label="Email" />
            </Fieldset>
            <Divider data-testid="divider" />
            <div data-testid="elements">
                <h6>A bare heading</h6>
                <p>A bare paragraph.</p>
                <ul>
                    <li>A bare list</li>
                </ul>
            </div>
        </Stack>
    );
}

const meta = {
    title: 'Theme/Bootstrap Reboot',
    component: RebootCheck,
    globals: { theme: 'bootstrap' },
} satisfies Meta<typeof RebootCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithBootstrapCss: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const style = (element: Element) => getComputedStyle(element);
        // Bootstrap's CSS is loaded: a bare heading outside of a root would get its margin.
        const title = canvas.getByRole('heading', { level: 5, name: 'A level 5 title' });
        await expect(style(title).marginBottom).toBe('0px');
        const legend = canvasElement.querySelector('legend') as Element;
        await expect(style(legend).float).toBe('none');
        await expect(style(canvas.getByTestId('divider')).opacity).toBe('1');
        const elements = canvas.getByTestId('elements');
        for (const element of elements.children) {
            await expect(style(element).marginBottom, element.tagName).toBe('0px');
        }
        await expect(style(elements.querySelector('ul') as Element).paddingLeft).toBe('0px');
    },
};
