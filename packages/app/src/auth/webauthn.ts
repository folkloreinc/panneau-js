// The WebAuthn ceremonies of passkeys in the browser (decision 0051): options and credentials in the
// JSON form of the WebAuthn spec, which the backend gives and checks, converted to and from the
// browser's binary values. The browser's own conversions are used when it has them.
import type { WebAuthnCredential } from '@panneau/data';

type Json = Record<string, unknown>;

interface PublicKeyCredentialStatics {
    parseRequestOptionsFromJSON?: (options: unknown) => PublicKeyCredentialRequestOptions;
    parseCreationOptionsFromJSON?: (options: unknown) => PublicKeyCredentialCreationOptions;
}

/** Whether the browser can use passkeys. */
export function supportsPasskeys(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.PublicKeyCredential === 'function' &&
        typeof navigator.credentials?.get === 'function'
    );
}

/** Whether an error is the user cancelling the prompt of the browser, or its timeout. */
export function isPasskeyCancelled(error: unknown): boolean {
    return (
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' || error.name === 'AbortError')
    );
}

function fromBase64Url(value: string): ArrayBuffer {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
}

function toBase64Url(value: ArrayBuffer | ArrayBufferView): string {
    const bytes =
        value instanceof ArrayBuffer
            ? new Uint8Array(value)
            : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function descriptors(list: unknown): PublicKeyCredentialDescriptor[] | undefined {
    return Array.isArray(list)
        ? list.map((item: Json) => ({
              ...item,
              type: 'public-key',
              id: fromBase64Url(String(item.id)),
          }))
        : undefined;
}

function requestOptions(options: Json): PublicKeyCredentialRequestOptions {
    const statics = window.PublicKeyCredential as unknown as PublicKeyCredentialStatics;
    if (statics.parseRequestOptionsFromJSON !== undefined) {
        return statics.parseRequestOptionsFromJSON(options);
    }
    const allowCredentials = descriptors(options.allowCredentials);
    return {
        ...options,
        challenge: fromBase64Url(String(options.challenge)),
        ...(allowCredentials !== undefined ? { allowCredentials } : {}),
    } as PublicKeyCredentialRequestOptions;
}

function creationOptions(options: Json): PublicKeyCredentialCreationOptions {
    const statics = window.PublicKeyCredential as unknown as PublicKeyCredentialStatics;
    if (statics.parseCreationOptionsFromJSON !== undefined) {
        return statics.parseCreationOptionsFromJSON(options);
    }
    const user = options.user as Json;
    const excludeCredentials = descriptors(options.excludeCredentials);
    return {
        ...options,
        challenge: fromBase64Url(String(options.challenge)),
        user: { ...user, id: fromBase64Url(String(user.id)) },
        ...(excludeCredentials !== undefined ? { excludeCredentials } : {}),
    } as PublicKeyCredentialCreationOptions;
}

/** A credential of the browser in the JSON form of the WebAuthn spec. */
function credentialJson(credential: PublicKeyCredential): WebAuthnCredential {
    if (typeof credential.toJSON === 'function') {
        return credential.toJSON() as unknown as WebAuthnCredential;
    }
    const { response } = credential;
    const encoded: Json = { clientDataJSON: toBase64Url(response.clientDataJSON) };
    if ('attestationObject' in response) {
        const attestation = response as AuthenticatorAttestationResponse;
        encoded.attestationObject = toBase64Url(attestation.attestationObject);
        encoded.transports = attestation.getTransports?.() ?? [];
    }
    if ('authenticatorData' in response) {
        const assertion = response as AuthenticatorAssertionResponse;
        encoded.authenticatorData = toBase64Url(assertion.authenticatorData);
        encoded.signature = toBase64Url(assertion.signature);
        encoded.userHandle =
            assertion.userHandle !== null ? toBase64Url(assertion.userHandle) : null;
    }
    return {
        id: credential.id,
        rawId: toBase64Url(credential.rawId),
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults(),
        response: encoded,
    };
}

function asPublicKey(credential: Credential | null): PublicKeyCredential {
    if (credential === null || !(credential instanceof window.PublicKeyCredential)) {
        throw new DOMException('No passkey was chosen.', 'NotAllowedError');
    }
    return credential;
}

/** Asks the browser for a passkey, for the options of a login. */
export async function getPasskey(options: Json): Promise<WebAuthnCredential> {
    const credential = await navigator.credentials.get({ publicKey: requestOptions(options) });
    return credentialJson(asPublicKey(credential));
}

/** Asks the browser to make a passkey, for the options of a registration. */
export async function createPasskey(options: Json): Promise<WebAuthnCredential> {
    const credential = await navigator.credentials.create({ publicKey: creationOptions(options) });
    return credentialJson(asPublicKey(credential));
}

/** A name for a new passkey: the browser and the system, as the user agent says them. */
export function defaultPasskeyName(userAgent: string = navigator.userAgent): string {
    const browser =
        [
            ['Edg/', 'Edge'],
            ['Firefox/', 'Firefox'],
            ['Chrome/', 'Chrome'],
            ['Safari/', 'Safari'],
        ].find(([token]) => userAgent.includes(token ?? ''))?.[1] ?? null;
    const system =
        [
            ['iPhone', 'iPhone'],
            ['iPad', 'iPad'],
            ['Android', 'Android'],
            ['Mac OS X', 'macOS'],
            ['Windows', 'Windows'],
            ['Linux', 'Linux'],
        ].find(([token]) => userAgent.includes(token ?? ''))?.[1] ?? null;
    return [browser, system].filter((part) => part !== null).join(' · ');
}
