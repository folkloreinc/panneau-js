import { describe, expect, it } from 'vitest';

import { UnauthorizedError, ValidationError, createApiError } from './errors';
import { readProblem } from './problem';

const json = (body: unknown, status: number, type = 'application/json') =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': type } });

describe('readProblem', () => {
    it('reads a problem body as is', async () => {
        const problem = { type: 'about:blank', title: 'Gone', status: 410, detail: 'Removed.' };
        expect(await readProblem(json(problem, 410, 'application/problem+json'))).toEqual(problem);
    });

    it("builds a problem from Laravel's validation body", async () => {
        const problem = await readProblem(
            json({ message: 'The email is invalid.', errors: { email: ['Invalid.'] } }, 422),
        );
        expect(problem).toEqual({
            type: 'about:blank',
            title: 'The email is invalid.',
            status: 422,
            errors: { email: ['Invalid.'] },
        });
        expect(createApiError(problem)).toBeInstanceOf(ValidationError);
    });

    it('falls back to the status without a body, and leaves the response readable', async () => {
        const response = new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
        const problem = await readProblem(response);
        expect(problem).toEqual({ type: 'about:blank', title: 'Unauthorized', status: 401 });
        expect(createApiError(problem)).toBeInstanceOf(UnauthorizedError);
        expect(await response.text()).toBe('Unauthorized');
    });
});
