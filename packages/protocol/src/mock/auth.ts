import { AUTH_PAGE_PATHS, EMAIL_UNVERIFIED_PROBLEM_TYPE } from '../constants';
import type { Auth, User } from '../schemas';
import type { Problem } from '../schemas/api';
import { PROBLEM_CONTENT_TYPE } from '../version';

/** A user of the mock backend. */
export interface MockUser {
    /** Defaults to the position of the user in `users`, from 1. */
    id?: string;
    /** Defaults to the email. */
    name?: string;
    email: string;
    password: string;
    /** Whether the email address is verified, for `auth.emailVerification`. Defaults to true. */
    emailVerified?: boolean;
}

/** An email that the mock backend "sends", with the path of its link under the app's base path. */
export interface MockMail {
    kind: 'password-reset' | 'email-verification';
    to: string;
    token: string;
    /** The page of the app that the link opens, with its query: `auth/reset-password?token=…`. */
    path: string;
}

/**
 * The auth of the mock backend: its users, and who is logged in. With it, the routes of the
 * `panneau` auth mode answer (`/auth/login`, `/auth/logout`, `/auth/session`, and those of
 * `auth.passwordReset` and `auth.emailVerification`), and the other routes answer `401` to
 * guests.
 */
export interface MockAuthOptions {
    users: MockUser[];
    /** The email of the user logged in at the start. Defaults to the first user; `null`: a guest. */
    loggedIn?: string | null;
    /** Called with each email the backend sends: there is no mailbox. */
    onMail?: (mail: MockMail) => void;
}

type Values = Record<string, unknown>;

interface Account {
    id: string;
    name: string;
    email: string;
    password: string;
    emailVerified: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+$/;

function json(status: number, body: unknown): Response {
    return new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers: status === 204 ? {} : { 'Content-Type': 'application/json' },
    });
}

function problem(status: number, title: string, extra: Partial<Problem> = {}): Response {
    const body: Problem = { type: 'about:blank', title, status, ...extra };
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': PROBLEM_CONTENT_TYPE },
    });
}

function invalid(errors: Record<string, string[]>): Response {
    return problem(422, 'The given data was invalid.', {
        type: 'urn:panneau:problem:validation',
        errors,
    });
}

function randomToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
        byte.toString(16).padStart(2, '0'),
    ).join('');
}

export interface MockAuth {
    /** The current user, as the definition and `/auth/session` give it. */
    user(): User | null;
    /** The answer of a route of `/auth/…`, without its first segment. */
    answer(segments: string[], method: string, readBody: () => Promise<Values>): Promise<Response>;
    /** The answer to a request of another route by the current user, when it is refused. */
    refuse(): Response | null;
}

export function createMockAuth(options: MockAuthOptions, settings: Auth | undefined): MockAuth {
    const accounts: Account[] = options.users.map((user, index) => ({
        id: user.id ?? String(index + 1),
        name: user.name ?? user.email,
        email: user.email,
        password: user.password,
        emailVerified: user.emailVerified ?? true,
    }));
    let current: Account | null =
        options.loggedIn === null
            ? null
            : ((options.loggedIn !== undefined
                  ? accounts.find((account) => account.email === options.loggedIn)
                  : accounts[0]) ?? null);
    // Tokens of the links sent, to their account
    const resets = new Map<string, Account>();
    const verifications = new Map<string, Account>();

    const find = (email: unknown) =>
        typeof email === 'string'
            ? accounts.find((account) => account.email.toLowerCase() === email.toLowerCase())
            : undefined;
    const userOf = (account: Account): User => ({
        id: account.id,
        name: account.name,
        email: account.email,
        abilities: {},
    });
    const send = (kind: MockMail['kind'], account: Account) => {
        const token = randomToken();
        const query = new URLSearchParams({ token });
        if (kind === 'password-reset') {
            resets.set(token, account);
            query.set('email', account.email);
        } else {
            verifications.set(token, account);
        }
        const page =
            kind === 'password-reset' ? AUTH_PAGE_PATHS.resetPassword : AUTH_PAGE_PATHS.verifyEmail;
        options.onMail?.({ kind, to: account.email, token, path: `${page}?${query.toString()}` });
    };

    const routes: Record<string, (body: () => Promise<Values>) => Promise<Response>> = {
        'GET session': () =>
            Promise.resolve(
                current !== null
                    ? json(200, { user: userOf(current) })
                    : problem(401, 'Unauthenticated.'),
            ),
        'POST login': async (body) => {
            const { email, password } = await body();
            const account = find(email);
            if (account === undefined || account.password !== password) {
                return invalid({ email: ['These credentials do not match our records.'] });
            }
            current = account;
            return json(200, { user: userOf(account) });
        },
        'POST logout': () => {
            current = null;
            return Promise.resolve(json(204, null));
        },
    };
    if (settings?.passwordReset === true) {
        routes['POST password/forgot'] = async (body) => {
            const { email } = await body();
            if (typeof email !== 'string' || !EMAIL.test(email)) {
                return invalid({ email: ['The email field must be a valid email address.'] });
            }
            const account = find(email);
            if (account !== undefined) {
                send('password-reset', account);
            }
            return json(204, null);
        };
        routes['POST password/reset'] = async (body) => {
            const { token, email, password } = await body();
            const account = typeof token === 'string' ? resets.get(token) : undefined;
            if (account === undefined || find(email) !== account) {
                return invalid({ email: ['This password reset token is invalid.'] });
            }
            if (typeof password !== 'string' || password.length < 8) {
                return invalid({ password: ['The password field must be at least 8 characters.'] });
            }
            account.password = password;
            resets.delete(token as string);
            return json(204, null);
        };
    }
    if (settings?.emailVerification === true) {
        routes['POST email/verification'] = () => {
            if (current === null) {
                return Promise.resolve(problem(401, 'Unauthenticated.'));
            }
            if (!current.emailVerified) {
                send('email-verification', current);
            }
            return Promise.resolve(json(204, null));
        };
        routes['POST email/verify'] = async (body) => {
            const { token } = await body();
            const account = typeof token === 'string' ? verifications.get(token) : undefined;
            if (account === undefined) {
                return invalid({ token: ['This verification link is invalid or has expired.'] });
            }
            account.emailVerified = true;
            verifications.delete(token as string);
            return json(204, null);
        };
    }

    return {
        user: () => (current !== null ? userOf(current) : null),
        answer: (segments, method, readBody) => {
            const route = routes[`${method} ${segments.join('/')}`];
            return route !== undefined
                ? route(readBody)
                : Promise.resolve(problem(404, 'Not found.'));
        },
        refuse: () => {
            if (current === null) {
                return problem(401, 'Unauthenticated.');
            }
            if (settings?.emailVerification === true && !current.emailVerified) {
                return problem(403, 'Your email address is not verified.', {
                    type: EMAIL_UNVERIFIED_PROBLEM_TYPE,
                });
            }
            return null;
        },
    };
}
