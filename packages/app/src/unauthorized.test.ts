import { describe, expect, it, vi } from 'vitest';

import { type DataAdapter, ForbiddenError, UnauthorizedError } from '@panneau/data';

import { createSessionState, watchUnauthorized } from './unauthorized';

const problem = (status: number) => ({ type: 'about:blank', title: 'Error', status });

describe('watchUnauthorized', () => {
    it('ends the session when a call rejects with an UnauthorizedError, and still rejects', async () => {
        const session = createSessionState();
        const listener = vi.fn();
        session.subscribe(listener);
        const error = new UnauthorizedError(problem(419));
        const adapter = watchUnauthorized(
            { getSession: () => Promise.reject(error) } as Partial<DataAdapter> as DataAdapter,
            session,
        );
        await expect(adapter.getSession()).rejects.toBe(error);
        expect(session.getStatus()).toBe('ended');
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('ignores other errors and results', async () => {
        const session = createSessionState();
        const adapter = watchUnauthorized(
            {
                getSession: () => Promise.reject(new ForbiddenError(problem(403))),
                search: () => Promise.resolve({ data: [] }),
            } as Partial<DataAdapter> as DataAdapter,
            session,
        );
        await expect(adapter.getSession()).rejects.toBeInstanceOf(ForbiddenError);
        await expect(adapter.search('a')).resolves.toEqual({ data: [] });
        expect(session.getStatus()).toBe('active');
    });

    it('keeps the methods of class-based adapters', async () => {
        class Adapter {
            private readonly name = 'Ada';
            getSession() {
                return Promise.resolve({ user: { id: '1', name: this.name } });
            }
        }
        const adapter = watchUnauthorized(
            new Adapter() as unknown as DataAdapter,
            createSessionState(),
        );
        await expect(adapter.getSession()).resolves.toEqual({ user: { id: '1', name: 'Ada' } });
    });
});

describe('createSessionState', () => {
    it('ends an active session, and keeps a logged-out one logged out', () => {
        const session = createSessionState();
        session.end();
        expect(session.getStatus()).toBe('ended');
        session.logIn();
        expect(session.getStatus()).toBe('active');
        session.logOut();
        session.end();
        expect(session.getStatus()).toBe('logged-out');
    });
});
