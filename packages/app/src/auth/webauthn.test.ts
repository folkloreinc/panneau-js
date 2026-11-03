import { afterEach, describe, expect, it, vi } from 'vitest';

import { createPasskey, defaultPasskeyName, getPasskey, isPasskeyCancelled } from './webauthn';

/** A credential of the browser, without `toJSON()`, as older browsers give it. */
class FakeCredential {
    readonly type = 'public-key';
    readonly authenticatorAttachment = 'platform';
    constructor(
        readonly id: string,
        readonly rawId: ArrayBuffer,
        readonly response: object,
    ) {}
    getClientExtensionResults() {
        return {};
    }
}

const bytes = (...values: number[]) => new Uint8Array(values).buffer;

describe('the WebAuthn ceremonies', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function stub(credentials: { get?: unknown; create?: unknown }) {
        vi.stubGlobal('PublicKeyCredential', FakeCredential);
        vi.stubGlobal('navigator', { credentials, userAgent: '' });
    }

    it('logs in: decodes the options, and encodes the assertion', async () => {
        const get = vi.fn(() =>
            Promise.resolve(
                new FakeCredential('cred', bytes(1, 2, 3), {
                    clientDataJSON: bytes(4),
                    authenticatorData: bytes(5, 6),
                    signature: bytes(255),
                    userHandle: null,
                }),
            ),
        );
        stub({ get });

        const credential = await getPasskey({
            challenge: 'AQID',
            allowCredentials: [{ type: 'public-key', id: 'BAU' }],
        });

        const publicKey = (
            get.mock.calls[0] as unknown as [{ publicKey: Record<string, unknown> }]
        )[0].publicKey;
        expect(new Uint8Array(publicKey.challenge as ArrayBuffer)).toEqual(
            new Uint8Array([1, 2, 3]),
        );
        expect(
            new Uint8Array((publicKey.allowCredentials as { id: ArrayBuffer }[])[0]?.id ?? bytes()),
        ).toEqual(new Uint8Array([4, 5]));
        expect(credential).toEqual({
            id: 'cred',
            rawId: 'AQID',
            type: 'public-key',
            authenticatorAttachment: 'platform',
            clientExtensionResults: {},
            response: {
                clientDataJSON: 'BA',
                authenticatorData: 'BQY',
                signature: '_w',
                userHandle: null,
            },
        });
    });

    it('adds a passkey: decodes the user, and encodes the attestation', async () => {
        const create = vi.fn(() =>
            Promise.resolve(
                new FakeCredential('new', bytes(9), {
                    clientDataJSON: bytes(1),
                    attestationObject: bytes(2),
                    getTransports: () => ['internal'],
                }),
            ),
        );
        stub({ create });

        const credential = await createPasskey({
            challenge: 'AQ',
            rp: { name: 'Panneau' },
            user: { id: 'MQ', name: 'ada@example.com', displayName: 'Ada' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        });

        const publicKey = (
            create.mock.calls[0] as unknown as [{ publicKey: Record<string, unknown> }]
        )[0].publicKey;
        expect(new TextDecoder().decode((publicKey.user as { id: ArrayBuffer }).id)).toBe('1');
        expect(credential).toMatchObject({
            id: 'new',
            rawId: 'CQ',
            response: { clientDataJSON: 'AQ', attestationObject: 'Ag', transports: ['internal'] },
        });
    });

    it('says when nothing was chosen', async () => {
        stub({ get: () => Promise.resolve(null) });
        const error: unknown = await getPasskey({ challenge: 'AQ' }).catch(
            (caught: unknown) => caught,
        );
        expect(isPasskeyCancelled(error)).toBe(true);
        expect(isPasskeyCancelled(new Error('Other'))).toBe(false);
    });
});

describe('defaultPasskeyName', () => {
    it('names the browser and the system', () => {
        expect(
            defaultPasskeyName(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
            ),
        ).toBe('Safari · macOS');
        expect(
            defaultPasskeyName(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0',
            ),
        ).toBe('Edge · Windows');
        expect(defaultPasskeyName('')).toBe('');
    });
});
