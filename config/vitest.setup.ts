import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

import { loadPanneauMessages } from '@panneau/intl';

// Pages and fields load their code on first use (#346): the first `import()` of a module in a test
// file transforms it, which can take more than the default second of `findBy…` and `waitFor` on a
// busy machine.
configure({ asyncUtilTimeout: 5000 });

// Panneau's French messages load on first use: tests that render in French get them from the
// start, as an app that waits for them does. `@panneau/intl` tests their loading.
await loadPanneauMessages('fr');

// Testing Library only cleans up by itself with Vitest's globals, which are off.
afterEach(() => {
    cleanup();
});
