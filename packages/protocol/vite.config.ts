import { definePackageConfig } from '../../config/vite.package.ts';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: {
        index: 'src/index.ts',
        'mock/index': 'src/mock/index.ts',
        'conformance/index': 'src/conformance/index.ts',
    },
});
