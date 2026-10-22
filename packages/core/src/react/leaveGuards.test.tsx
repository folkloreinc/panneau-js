import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LeaveGuardsProvider, createLeaveGuards, useLeaveGuard } from './leaveGuards';

describe('createLeaveGuards', () => {
    it('asks each guard in turn, and stops at the first that keeps the user', async () => {
        const guards = createLeaveGuards();
        expect(guards.isBlocking()).toBe(false);
        await expect(guards.confirmLeave()).resolves.toBe(true);

        const first = vi.fn(() => Promise.resolve(false));
        const second = vi.fn(() => Promise.resolve(true));
        const removeFirst = guards.add(first);
        guards.add(second);
        expect(guards.isBlocking()).toBe(true);
        await expect(guards.confirmLeave()).resolves.toBe(false);
        expect(second).not.toHaveBeenCalled();

        removeFirst();
        await expect(guards.confirmLeave()).resolves.toBe(true);
        expect(second).toHaveBeenCalledOnce();
    });
});

describe('useLeaveGuard', () => {
    it('guards while active, with the latest guard', async () => {
        const guards = createLeaveGuards();
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <LeaveGuardsProvider guards={guards}>{children}</LeaveGuardsProvider>
        );
        const { rerender, unmount } = renderHook(
            ({ active, answer }: { active: boolean; answer: boolean }) =>
                useLeaveGuard(active, () => Promise.resolve(answer)),
            { wrapper, initialProps: { active: false, answer: false } },
        );
        expect(guards.isBlocking()).toBe(false);

        rerender({ active: true, answer: false });
        await expect(guards.confirmLeave()).resolves.toBe(false);
        rerender({ active: true, answer: true });
        await expect(guards.confirmLeave()).resolves.toBe(true);

        unmount();
        expect(guards.isBlocking()).toBe(false);
    });

    it('does nothing without a provider', () => {
        expect(() =>
            renderHook(() => useLeaveGuard(true, () => Promise.resolve(false))),
        ).not.toThrow();
    });
});
