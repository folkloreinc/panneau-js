import { z } from 'zod';

import { type Definition, User } from '../schemas';
import { ConnectionsResponse, Passkey, TwoFactorStatus, WebAuthnOptions } from '../schemas/api';
import { UNKNOWN } from './check';
import { type ConformanceRun } from './run';

const AccountResponse = z.looseObject({ data: User });
const PasskeysResponse = z.looseObject({ data: z.array(Passkey) });

/**
 * Authentication: password reset and email verification, the account, OAuth providers, passkeys and
 * two-factor authentication (decisions 0048 to 0052), and the connections of the account (0113).
 */
export async function checkAuth(ctx: ConformanceRun): Promise<void> {
    const { request, run } = ctx;
    const { definition } = ctx.state;

    // Password reset and email verification (decision 0048), with addresses and tokens that don't
    // exist: no email is sent.
    const auth = () => (definition as Definition | null)?.auth;
    const NOBODY = 'nobody@conformance.invalid';

    await run(
        'auth.password-forgot',
        'POST /auth/password/forgot answers the same for an unknown address, and refuses an invalid one',
        async (check) => {
            if (auth()?.passwordReset !== true) {
                check.skip('The definition has no `auth.passwordReset`.');
                return;
            }
            check.expectStatus(
                await request('/auth/password/forgot', {
                    method: 'POST',
                    body: JSON.stringify({ email: NOBODY }),
                }),
                204,
            );
            const invalid = check.expectProblem(
                await request('/auth/password/forgot', { method: 'POST', body: '{}' }),
                422,
            );
            if (invalid !== null) {
                check.expect(
                    (invalid.errors?.email?.length ?? 0) > 0,
                    'Expected a message in `errors.email`.',
                );
            }
        },
    );

    await run(
        'auth.password-reset',
        'POST /auth/password/reset refuses a token that does not exist',
        async (check) => {
            if (auth()?.passwordReset !== true) {
                check.skip('The definition has no `auth.passwordReset`.');
                return;
            }
            check.expectProblem(
                await request('/auth/password/reset', {
                    method: 'POST',
                    body: JSON.stringify({
                        token: UNKNOWN,
                        email: NOBODY,
                        password: 'Conformance-Password-1',
                    }),
                }),
                422,
            );
        },
    );

    await run(
        'auth.email-verify',
        'POST /auth/email/verify refuses a token that does not exist',
        async (check) => {
            if (auth()?.emailVerification !== true) {
                check.skip('The definition has no `auth.emailVerification`.');
                return;
            }
            const invalid = check.expectProblem(
                await request('/auth/email/verify', {
                    method: 'POST',
                    body: JSON.stringify({ token: UNKNOWN }),
                }),
                422,
            );
            if (invalid !== null) {
                check.expect(
                    (invalid.errors?.token?.length ?? 0) > 0,
                    'Expected a message in `errors.token`.',
                );
            }
        },
    );

    // The account page (decision 0050): the current user, without changing it.
    await run('account', 'GET /account gives the current user', async (check) => {
        if (auth()?.account !== true) {
            check.skip('The definition has no `auth.account`.');
            return;
        }
        const reply = await request('/account');
        if (check.expectStatus(reply, 200)) {
            check.expectSchema(AccountResponse, reply.body, 'The account');
        }
    });

    // OAuth providers (decision 0052): their redirect, without following it.
    await run(
        'auth.providers',
        'GET /auth/providers/{provider}/redirect starts the login of each provider',
        async (check) => {
            // Those the app links to
            const providers = (auth()?.providers ?? []).filter(({ url }) => url !== undefined);
            if (providers.length === 0) {
                check.skip('The definition has no `auth.providers` with a `url`.');
                return;
            }
            for (const provider of providers) {
                const reply = await request(
                    `/auth/providers/${encodeURIComponent(provider.id)}/redirect?next=%2F`,
                    { redirect: 'manual' },
                );
                check.expect(
                    reply.status === 0 || (reply.status >= 301 && reply.status <= 308),
                    `Expected a redirection for "${provider.id}", got ${reply.status}.`,
                );
            }
            check.expectProblem(
                await request(`/auth/providers/${UNKNOWN}/redirect`, { redirect: 'manual' }),
                404,
            );
        },
    );

    // Passkeys (decision 0051): the options of a login, a credential that doesn't exist, and the
    // list of the account, without adding one.
    await run(
        'auth.passkeys',
        'POST /auth/passkeys/options gives options, and a login refuses an unknown passkey',
        async (check) => {
            if (auth()?.passkeys !== true) {
                check.skip('The definition has no `auth.passkeys`.');
                return;
            }
            const reply = await request('/auth/passkeys/options', { method: 'POST' });
            if (check.expectStatus(reply, 200)) {
                const options = check.expectSchema(WebAuthnOptions, reply.body, 'The options');
                check.expect(
                    typeof options?.options.challenge === 'string',
                    'Expected a `challenge` in the options.',
                );
            }
            check.expectProblem(
                await request('/auth/passkeys/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        credential: {
                            id: UNKNOWN,
                            rawId: UNKNOWN,
                            type: 'public-key',
                            response: {},
                        },
                    }),
                }),
                422,
            );
        },
    );

    await run(
        'account.passkeys',
        'GET /account/passkeys lists the passkeys of the user',
        async (check) => {
            if (auth()?.passkeys !== true) {
                check.skip('The definition has no `auth.passkeys`.');
                return;
            }
            const reply = await request('/account/passkeys');
            if (check.expectStatus(reply, 200)) {
                check.expectSchema(PasskeysResponse, reply.body, 'The passkeys');
            }
        },
    );

    // The connections of the account to the MCP server (decision 0113): listing changes nothing.
    await run(
        'account.connections',
        'GET /account/connections lists the connections of the user',
        async (check) => {
            const current = definition as Definition | null;
            if (current?.agents?.mcp === undefined || current.auth?.mode !== 'panneau') {
                check.skip('The definition has no `agents.mcp` with the `panneau` auth mode.');
                return;
            }
            const reply = await request('/account/connections');
            if (check.expectStatus(reply, 200)) {
                check.expectSchema(ConnectionsResponse, reply.body, 'The connections');
            }
        },
    );

    // Two-factor authentication (decision 0049): the status of the user, and a challenge without a
    // login that waits for it. Nothing about the user changes.
    await run(
        'account.two-factor',
        'GET /account/two-factor gives the two-factor authentication of the user',
        async (check) => {
            if (auth()?.twoFactor !== true) {
                check.skip('The definition has no `auth.twoFactor`.');
                return;
            }
            const reply = await request('/account/two-factor');
            if (check.expectStatus(reply, 200)) {
                check.expectSchema(TwoFactorStatus, reply.body, 'The status');
            }
        },
    );

    await run(
        'auth.two-factor-challenge',
        'POST /auth/two-factor/challenge refuses a code without a login that waits for it',
        async (check) => {
            if (auth()?.twoFactor !== true) {
                check.skip('The definition has no `auth.twoFactor`.');
                return;
            }
            check.expectProblem(
                await request('/auth/two-factor/challenge', {
                    method: 'POST',
                    body: JSON.stringify({ code: '000000' }),
                }),
                422,
            );
        },
    );
}
