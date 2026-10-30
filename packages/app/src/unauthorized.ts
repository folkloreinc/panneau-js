import { type DataAdapter, UnauthorizedError } from '@panneau/data';
import type { Auth, BootConfig, Definition } from '@panneau/protocol';

/**
 * Where the session is: `active`, `ended` when the API answered that the user isn't authenticated,
 * or `logged-out` when the user logged out from the app.
 */
export type SessionStatus = 'active' | 'ended' | 'logged-out';

/** The status of the session, with a way to know when it changes. */
export interface SessionState {
    getStatus(): SessionStatus;
    subscribe(listener: () => void): () => void;
    /** The API answered `401`: an active session ends. A logged-out one stays logged out. */
    end(): void;
    logOut(): void;
    logIn(): void;
}

export function createSessionState(): SessionState {
    let status: SessionStatus = 'active';
    const listeners = new Set<() => void>();
    const set = (next: SessionStatus) => {
        if (status !== next) {
            status = next;
            listeners.forEach((listener) => listener());
        }
    };
    return {
        getStatus: () => status,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        end() {
            if (status === 'active') {
                set('ended');
            }
        },
        logOut: () => set('logged-out'),
        logIn: () => set('active'),
    };
}

/**
 * Wraps an adapter so that every call that rejects with an `UnauthorizedError` (`401`, or `419`
 * with the Laravel preset) ends the session. The call still rejects.
 */
export function watchUnauthorized(adapter: DataAdapter, session: SessionState): DataAdapter {
    return new Proxy(adapter, {
        get(target, key, receiver) {
            const value: unknown = Reflect.get(target, key, receiver);
            if (typeof value !== 'function') {
                return value;
            }
            return (...args: unknown[]): unknown => {
                const result: unknown = Reflect.apply(value, target, args);
                if (result instanceof Promise) {
                    return result.catch((error: unknown) => {
                        if (error instanceof UnauthorizedError) {
                            session.end();
                        }
                        throw error;
                    });
                }
                return result;
            };
        },
    });
}

/**
 * Where to send unauthenticated users: `auth.loginUrl` in `external` mode, the `loginUrl` of the
 * boot config before the definition is loaded, and nowhere in `panneau` mode, whose login page is
 * part of the app.
 */
export function getLoginUrl(definition: Definition | undefined, config: BootConfig): string | null {
    const auth = getAuth(definition, config);
    if (auth?.mode === 'panneau') {
        return null;
    }
    return auth?.loginUrl ?? config.loginUrl ?? null;
}

/**
 * The auth settings in effect: those of the definition, or of the boot config before the
 * definition is loaded.
 */
export function getAuth(definition: Definition | undefined, config: BootConfig): Auth | null {
    return definition?.auth ?? config.auth ?? null;
}
