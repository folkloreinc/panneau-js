import { describe, expect, it, vi } from 'vitest';

import { UnauthorizedError, ValidationError } from '../errors';
import { createLaravelError } from '../laravel';
import { createPresignedUploads } from './index';

const upload = { id: 'upl_1', key: 'uploads/upl_1', name: 'video.mp4', size: 1000 };

function backend(answers: Record<string, () => Response>) {
    const requests: { url: string; init: RequestInit }[] = [];
    const fetch = vi.fn((url: string, init: RequestInit) => {
        requests.push({ url, init });
        const answer = Object.entries(answers).find(([path]) => url.endsWith(path))?.[1];
        return Promise.resolve(answer?.() ?? new Response(null, { status: 404 }));
    });
    return { fetch, requests };
}

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

describe('createPresignedUploads', () => {
    it('signs requests, then completes the upload the backend named', async () => {
        const { fetch, requests } = backend({
            '/uploads/sign': () =>
                json({ url: 'https://s3.test/signed', key: 'uploads/upl_1', upload: 'upl_1' }),
            '/uploads/upl_1/complete': () => json({ data: upload }),
        });
        const uploads = createPresignedUploads({
            baseUrl: '/panneau/api/',
            fetch,
            headers: { 'X-XSRF-TOKEN': 'token' },
        });
        await expect(uploads.signRequest({ method: 'POST', key: 'video.mp4' })).resolves.toEqual({
            url: 'https://s3.test/signed',
            key: 'uploads/upl_1',
        });
        expect(requests[0]?.url).toBe('/panneau/api/uploads/sign');
        expect(JSON.parse(String(requests[0]?.init.body))).toEqual({
            method: 'POST',
            key: 'video.mp4',
        });
        expect(new Headers(requests[0]?.init.headers).get('X-XSRF-TOKEN')).toBe('token');
        expect(requests[0]?.init.credentials).toBe('include');

        await expect(uploads.complete('uploads/upl_1', { name: 'video.mp4' })).resolves.toEqual(
            upload,
        );
        expect(requests[1]?.url).toBe('/panneau/api/uploads/upl_1/complete');
        expect(JSON.parse(String(requests[1]?.init.body))).toEqual({ name: 'video.mp4' });
    });

    it('reads the upload from the key when the backend does not name it, at its own endpoint', async () => {
        const { fetch, requests } = backend({
            '/uploads/sign': () => json({ url: 'https://s3.test/signed', key: 'uploads/upl_2' }),
            '/uploads/upl_2/complete': () => json({ data: { id: 'upl_2' } }),
        });
        const uploads = createPresignedUploads({ endpoint: '/uploads', fetch });
        await uploads.signRequest({ method: 'PUT', key: 'image.jpg', contentType: 'image/jpeg' });
        await uploads.complete('uploads/upl_2');
        expect(requests[1]?.url).toBe('/uploads/upl_2/complete');
    });

    it('rejects with the typed errors of the backend', async () => {
        const { fetch } = backend({
            '/uploads/sign': () => json({ message: 'Session expired.' }, 419),
            '/uploads/upl_3/complete': () =>
                json({ message: 'Too large.', errors: { file: ['Too large.'] } }, 422),
        });
        const uploads = createPresignedUploads({
            endpoint: '/uploads',
            fetch,
            createError: createLaravelError,
        });
        await expect(uploads.signRequest({ method: 'POST', key: 'a.mp4' })).rejects.toBeInstanceOf(
            UnauthorizedError,
        );
        await expect(uploads.complete('uploads/upl_3')).rejects.toBeInstanceOf(ValidationError);
    });
});
