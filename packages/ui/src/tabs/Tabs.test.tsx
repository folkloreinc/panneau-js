import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Badge } from '../badge/Badge';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

describe('Tabs', () => {
    it('switches panels with the keyboard', async () => {
        render(
            <Tabs>
                <TabList aria-label="Sections">
                    <Tab id="content">Content</Tab>
                    <Tab id="seo">
                        SEO <Badge tone="danger">2</Badge>
                    </Tab>
                </TabList>
                <TabPanel id="content">Content panel</TabPanel>
                <TabPanel id="seo">SEO panel</TabPanel>
            </Tabs>,
        );
        expect(screen.getByRole('tabpanel')).toHaveTextContent('Content panel');
        await userEvent.click(screen.getByRole('tab', { name: 'Content' }));
        await userEvent.keyboard('{ArrowRight}');
        expect(screen.getByRole('tab', { name: /SEO/ })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tabpanel')).toHaveTextContent('SEO panel');
    });

    it('keeps hidden panels mounted with shouldForceMount', async () => {
        render(
            <Tabs>
                <TabList aria-label="Sections">
                    <Tab id="a">A</Tab>
                    <Tab id="b">B</Tab>
                </TabList>
                <TabPanel id="a" shouldForceMount>
                    <input aria-label="kept" />
                </TabPanel>
                <TabPanel id="b">B panel</TabPanel>
            </Tabs>,
        );
        await userEvent.click(screen.getByRole('tab', { name: 'B' }));
        expect(screen.getByLabelText('kept', { selector: 'input' })).toBeInTheDocument();
    });
});
