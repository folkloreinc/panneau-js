import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only cleans up by itself with Vitest's globals, which are off.
afterEach(() => {
    cleanup();
});
