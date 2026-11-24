import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Aside, AsideLayout, AsidePanel } from './Aside';

afterEach(() => {
    window.localStorage.clear();
});

describe('Aside', () => {
    it('is a region with its title, its toolbar and its content', () => {
        render(
            <Aside label="Details: Article" title="Hello" toolbar={<button>Edit</button>}>
                <p>Values</p>
            </Aside>,
        );
        const region = screen.getByRole('region', { name: 'Details: Article' });
        expect(region).toContainElement(screen.getByRole('heading', { level: 2, name: 'Hello' }));
        expect(region).toContainElement(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByText('Values')).toBeInTheDocument();
    });

    it('draws a skeleton of its title while it loads', () => {
        render(<Aside label="Details" isLoading />);
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        expect(document.querySelector('.panneau-skeleton')).not.toBeNull();
    });

    it('closes with its button and with Escape', async () => {
        const onClose = vi.fn();
        render(
            <Aside label="Details" onClose={onClose}>
                <button>Inside</button>
            </Aside>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledTimes(1);
        screen.getByRole('button', { name: 'Inside' }).focus();
        await userEvent.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('widens, and remembers it under its key', async () => {
        render(<Aside label="Details" isWidenable storageKey="item-panel" />);
        expect(screen.getByRole('region')).not.toHaveAttribute('data-wide');
        await userEvent.click(screen.getByRole('button', { name: 'Widen the panel' }));
        expect(screen.getByRole('region')).toHaveAttribute('data-wide', 'true');
        expect(window.localStorage.getItem('panneau:item-panel-size')).toBe('wide');
        expect(screen.getByRole('button', { name: 'Narrow the panel' })).toBeInTheDocument();
    });

    it('starts widened when the browser remembers it', () => {
        window.localStorage.setItem('panneau:item-panel-size', 'wide');
        render(<Aside label="Details" isWidenable storageKey="item-panel" />);
        expect(screen.getByRole('region')).toHaveAttribute('data-wide', 'true');
    });

    it('has no header without a title or buttons', () => {
        render(<Aside label="Sidebar">Content</Aside>);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('region').querySelector('header')).toBeNull();
    });
});

describe('AsidePanel', () => {
    it('collapses under its title, and remembers it under the key of its aside', async () => {
        render(
            <Aside label="Sidebar" storageKey="form-articles">
                <AsidePanel id="publication" title="Publication">
                    <p>Published</p>
                </AsidePanel>
            </Aside>,
        );
        const trigger = screen.getByRole('button', { name: 'Publication' });
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Published')).toBeVisible();
        await userEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(window.localStorage.getItem('panneau:form-articles-panel-publication')).toBe(
            'collapsed',
        );
    });

    it('starts collapsed with defaultCollapsed, unless the browser remembers it expanded', () => {
        window.localStorage.setItem('panneau:form-articles-panel-seo', 'expanded');
        render(
            <Aside label="Sidebar" storageKey="form-articles">
                <AsidePanel id="dates" title="Dates" defaultCollapsed>
                    Dates
                </AsidePanel>
                <AsidePanel id="seo" title="SEO" defaultCollapsed>
                    SEO
                </AsidePanel>
            </Aside>,
        );
        expect(screen.getByRole('button', { name: 'Dates' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        expect(screen.getByRole('button', { name: 'SEO' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
    });

    it('is a titled section when it can not be collapsed, and its content without a title', () => {
        render(
            <Aside label="Sidebar">
                <AsidePanel title="Status" isCollapsible={false}>
                    Draft
                </AsidePanel>
                <AsidePanel>Plain</AsidePanel>
            </Aside>,
        );
        expect(screen.getByRole('heading', { level: 3, name: 'Status' })).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByText('Plain')).toBeInTheDocument();
    });
});

describe('AsideLayout', () => {
    it('keeps its content in place when the aside opens', () => {
        const { rerender } = render(
            <AsideLayout>
                <input aria-label="Search" />
            </AsideLayout>,
        );
        const input = screen.getByRole('textbox', { name: 'Search' });
        rerender(
            <AsideLayout aside={<Aside label="Details">Values</Aside>} narrow="overlay">
                <input aria-label="Search" />
            </AsideLayout>,
        );
        expect(screen.getByRole('textbox', { name: 'Search' })).toBe(input);
        expect(screen.getByRole('region', { name: 'Details' })).toBeInTheDocument();
    });

    it('puts the aside over the content at every width with placement="overlay"', () => {
        const { container } = render(
            <AsideLayout aside={<Aside label="Details">Values</Aside>} placement="overlay">
                <input aria-label="Search" />
            </AsideLayout>,
        );
        const grid = container.querySelector('.panneau-aside-layout > div');
        expect(grid?.className).toMatch(/overlay/);
        expect(grid?.className).toMatch(/alwaysOverlay/);
        expect(grid?.className).not.toMatch(/withAside/);
    });

    describe('with narrow="before"', () => {
        let width = 0;
        const observers: (() => void)[] = [];
        const resize = (next: number) => {
            width = next;
            act(() => {
                for (const observe of observers) {
                    observe();
                }
            });
        };
        beforeEach(() => {
            observers.length = 0;
            vi.stubGlobal(
                'ResizeObserver',
                class {
                    constructor(callback: () => void) {
                        observers.push(callback);
                    }
                    observe() {}
                    disconnect() {}
                },
            );
            vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width);
        });
        afterEach(() => {
            vi.unstubAllGlobals();
            vi.restoreAllMocks();
        });

        const renderLayout = (onBeforeChange = vi.fn()) =>
            render(
                <AsideLayout
                    narrow="before"
                    onBeforeChange={onBeforeChange}
                    aside={
                        <Aside label="Sidebar" title="Sidebar" summary="Publication · Files">
                            <input aria-label="Date" />
                        </Aside>
                    }
                >
                    <input aria-label="Title" />
                </AsideLayout>,
            );

        it('puts the aside beside the content from 56rem, after it in the page', () => {
            width = 1000;
            const onBeforeChange = vi.fn();
            renderLayout(onBeforeChange);
            const aside = screen.getByRole('region', { name: 'Sidebar' });
            expect(aside).not.toHaveAttribute('data-before');
            expect(
                screen.getByRole('textbox', { name: 'Title' }).compareDocumentPosition(aside) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
            expect(screen.getByRole('heading', { name: 'Sidebar' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Publication · Files' })).toBeNull();
            expect(onBeforeChange).toHaveBeenLastCalledWith(false);
        });

        it('puts it before the content when narrower, collapsed, with its summary', async () => {
            width = 400;
            const onBeforeChange = vi.fn();
            renderLayout(onBeforeChange);
            const aside = screen.getByRole('region', { name: 'Sidebar' });
            expect(aside).toHaveAttribute('data-before');
            expect(
                aside.compareDocumentPosition(screen.getByRole('textbox', { name: 'Title' })) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
            expect(onBeforeChange).toHaveBeenLastCalledWith(true);
            const toggle = screen.getByRole('button', { name: 'Publication · Files' });
            expect(toggle).toHaveAttribute('aria-expanded', 'false');
            expect(screen.queryByRole('textbox', { name: 'Date' })).toBeNull();
            await userEvent.click(toggle);
            expect(toggle).toHaveAttribute('aria-expanded', 'true');
            expect(screen.getByRole('textbox', { name: 'Date' })).toBeVisible();
        });

        it('moves the aside without losing what it holds', async () => {
            width = 1000;
            renderLayout();
            const date = screen.getByRole('textbox', { name: 'Date' });
            await userEvent.type(date, '2026');
            resize(400);
            await userEvent.click(screen.getByRole('button', { name: 'Publication · Files' }));
            expect(screen.getByRole('textbox', { name: 'Date' })).toBe(date);
            expect(date).toHaveValue('2026');
            resize(1000);
            expect(screen.getByRole('textbox', { name: 'Date' })).toBe(date);
            expect(screen.queryByRole('button', { name: 'Publication · Files' })).toBeNull();
        });
    });
});
