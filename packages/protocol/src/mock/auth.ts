import {
    AUTH_PAGE_PATHS,
    EMAIL_UNVERIFIED_PROBLEM_TYPE,
    TWO_FACTOR_REQUIRED_PROBLEM_TYPE,
} from '../constants';
import type { Auth, User } from '../schemas';
import type { Problem, TwoFactorStatus } from '../schemas/api';
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
    /**
     * Whether the user has two-factor authentication, for `auth.twoFactor`: their password login
     * then asks for `twoFactorCode` or a recovery code. Defaults to false.
     */
    twoFactor?: boolean;
    /** Recovery codes of a user with `twoFactor`. Defaults to none. */
    recoveryCodes?: string[];
    /** Whether the backend requires two-factor authentication for the user. Defaults to false. */
    twoFactorRequired?: boolean;
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
    /** The code of the authenticator app of every user, for `auth.twoFactor`. Defaults to `123456`. */
    twoFactorCode?: string;
}

type Values = Record<string, unknown>;

interface Account {
    id: string;
    name: string;
    email: string;
    password: string;
    emailVerified: boolean;
    twoFactor: TwoFactorStatus['status'];
    recoveryCodes: string[];
    twoFactorRequired: boolean;
}

/** The secret that the mock backend gives every two-factor setup. */
const SECRET = 'JBSWY3DPEHPK3PXP';

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

function recoveryCodes(): string[] {
    return Array.from(
        { length: 8 },
        () => `${randomToken().slice(0, 5)}-${randomToken().slice(0, 5)}`,
    );
}

export interface MockAuth {
    /** The current user, as the definition and `/auth/session` give it. */
    user(): User | null;
    /** The answer of a route of `/auth/…`, without its first segment. */
    answer(segments: string[], method: string, readBody: () => Promise<Values>): Promise<Response>;
    /** The answer of a route of `/account/…`, without its first segment, or null for another. */
    account(
        segments: string[],
        method: string,
        readBody: () => Promise<Values>,
    ): Promise<Response> | null;
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
        twoFactor: user.twoFactor === true ? 'enabled' : 'disabled',
        recoveryCodes: [...(user.recoveryCodes ?? [])],
        twoFactorRequired: user.twoFactorRequired ?? false,
    }));
    const code = options.twoFactorCode ?? '123456';
    // A password login that waits for its second factor
    let pending: { account: Account } | null = null;
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
            if (settings?.twoFactor === true && account.twoFactor === 'enabled') {
                pending = { account };
                return json(202, { twoFactor: true });
            }
            current = account;
            return json(200, { user: userOf(account) });
        },
        'POST logout': () => {
            current = null;
            pending = null;
            return Promise.resolve(json(204, null));
        },
    };
    if (settings?.twoFactor === true) {
        routes['POST two-factor/challenge'] = async (body) => {
            const answer = await body();
            if (pending === null) {
                return invalid({ code: ['The login has expired. Log in again.'] });
            }
            const { account } = pending;
            if (typeof answer.recoveryCode === 'string') {
                const index = account.recoveryCodes.indexOf(answer.recoveryCode);
                if (index === -1) {
                    return invalid({ recoveryCode: ['This recovery code is invalid.'] });
                }
                account.recoveryCodes.splice(index, 1);
            } else if (answer.code !== code) {
                return invalid({ code: ['This code is invalid.'] });
            }
            pending = null;
            current = account;
            return json(200, { user: userOf(account) });
        };
        routes['POST password/confirm'] = async (body) => {
            const { password } = await body();
            if (current === null) {
                return problem(401, 'Unauthenticated.');
            }
            return password === current.password
                ? json(204, null)
                : invalid({ password: ['The password is incorrect.'] });
        };
    }
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

    const conflict = (title: string) => problem(409, title);
    const twoFactorRoutes: Record<
        string,
        (account: Account, body: () => Promise<Values>) => Promise<Response> | Response
    > = {
        GET: (account) =>
            json(200, { status: account.twoFactor, required: account.twoFactorRequired }),
        POST: (account) => {
            if (account.twoFactor === 'enabled') {
                return conflict('Two-factor authentication is already on.');
            }
            account.twoFactor = 'pending';
            const label = encodeURIComponent(`Panneau:${account.email}`);
            return json(200, {
                secret: SECRET,
                otpauthUrl: `otpauth://totp/${label}?secret=${SECRET}&issuer=Panneau`,
            });
        },
        DELETE: (account) => {
            if (account.twoFactorRequired) {
                return conflict('Two-factor authentication is required for this account.');
            }
            account.twoFactor = 'disabled';
            account.recoveryCodes = [];
            return json(204, null);
        },
        'POST confirm': async (account, body) => {
            if (account.twoFactor !== 'pending') {
                return conflict('Two-factor authentication isn’t being set up.');
            }
            if ((await body()).code !== code) {
                return invalid({ code: ['This code is invalid.'] });
            }
            account.twoFactor = 'enabled';
            account.recoveryCodes = recoveryCodes();
            return json(200, { recoveryCodes: account.recoveryCodes });
        },
        'POST recovery-codes': (account) => {
            if (account.twoFactor !== 'enabled') {
                return conflict('Two-factor authentication is off.');
            }
            account.recoveryCodes = recoveryCodes();
            return json(200, { recoveryCodes: account.recoveryCodes });
        },
    };
    const accountRoutes: Record<
        string,
        (account: Account, body: () => Promise<Values>) => Promise<Response> | Response
    > = {
        GET: (account) => json(200, { data: userOf(account) }),
        PATCH: async (account, body) => {
            const { name, email } = await body();
            const errors: Record<string, string[]> = {};
            if (typeof name !== 'string' || name.trim() === '') {
                errors.name = ['The name field is required.'];
            }
            if (typeof email !== 'string' || !EMAIL.test(email)) {
                errors.email = ['The email field must be a valid email address.'];
            } else if (find(email) !== undefined && find(email) !== account) {
                errors.email = ['The email has already been taken.'];
            }
            if (Object.keys(errors).length > 0) {
                return invalid(errors);
            }
            const changed = (email as string).toLowerCase() !== account.email.toLowerCase();
            account.name = name as string;
            account.email = email as string;
            if (changed && settings?.emailVerification === true) {
                account.emailVerified = false;
                send('email-verification', account);
            }
            return json(200, { data: userOf(account) });
        },
        'PUT password': async (account, body) => {
            const { currentPassword, password } = await body();
            if (currentPassword !== account.password) {
                return invalid({
                    currentPassword: [
                        'The provided password does not match your current password.',
                    ],
                });
            }
            if (typeof password !== 'string' || password.length < 8) {
                return invalid({ password: ['The password field must be at least 8 characters.'] });
            }
            account.password = password;
            return json(204, null);
        },
    };
    const refuseUnverified = (account: Account) =>
        settings?.emailVerification === true && !account.emailVerified
            ? problem(403, 'Your email address is not verified.', {
                  type: EMAIL_UNVERIFIED_PROBLEM_TYPE,
              })
            : null;

    return {
        user: () => (current !== null ? userOf(current) : null),
        account: (segments, method, readBody) => {
            const twoFactor = segments[0] === 'two-factor' && settings?.twoFactor === true;
            if (!twoFactor && settings?.account !== true) {
                return null;
            }
            if (current === null) {
                return Promise.resolve(problem(401, 'Unauthenticated.'));
            }
            const refused = twoFactor ? refuseUnverified(current) : refuse();
            const route = twoFactor
                ? twoFactorRoutes[[method, ...segments.slice(1)].join(' ')]
                : accountRoutes[[method, ...segments].join(' ')];
            if (refused !== null || route === undefined) {
                return Promise.resolve(refused ?? problem(404, 'Not found.'));
            }
            return Promise.resolve(route(current, readBody));
        },
        answer: (segments, method, readBody) => {
            const route = routes[`${method} ${segments.join('/')}`];
            return route !== undefined
                ? route(readBody)
                : Promise.resolve(problem(404, 'Not found.'));
        },
        refuse,
    };

    function refuse(): Response | null {
        if (current === null) {
            return problem(401, 'Unauthenticated.');
        }
        const unverified = refuseUnverified(current);
        if (unverified !== null) {
            return unverified;
        }
        if (
            settings?.twoFactor === true &&
            current.twoFactorRequired &&
            current.twoFactor !== 'enabled'
        ) {
            return problem(403, 'Two-factor authentication is required for this account.', {
                type: TWO_FACTOR_REQUIRED_PROBLEM_TYPE,
            });
        }
        return null;
    }
}
