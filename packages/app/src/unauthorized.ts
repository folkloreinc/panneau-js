import { type DataAdapter, UnauthorizedError } from '@panneau/data';
import type { BootConfig, Definition } from '@panneau/protocol';

/** Whether the API said that the user isn't authenticated, with a way to know when it does. */
export interface SessionState {
    isSignedOut(): boolean;
    subscribe(listener: () => void): () => void;
    signOut(): void;
}

export function createSessionState(): SessionState {
    let signedOut = false;
    const listeners = new Set<() => void>();
    return {
        isSignedOut: () => signedOut,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        signOut() {
            if (!signedOut) {
                signedOut = true;
                listeners.forEach((listener) => listener());
            }
        },
    };
}

/**
 * Wraps an adapter so that every call that rejects with an `UnauthorizedError` (`401`, or `419`
 * with the Laravel preset) signs the session out. The call still rejects.
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
                            session.signOut();
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
 * Where to send unauthenticated users: `auth.loginUrl` of the definition in `external` mode, the
 * `loginUrl` of the boot config before the definition is loaded, and nowhere in `panneau` mode,
 * whose login page is part of the app.
 */
export function getLoginUrl(definition: Definition | undefined, config: BootConfig): string | null {
    if (definition?.auth?.mode === 'panneau') {
        return null;
    }
    return definition?.auth?.loginUrl ?? config.loginUrl ?? null;
}
