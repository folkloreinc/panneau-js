import { definePackageConfig } from '../../config/vite.package.ts';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: {
        index: 'src/index.ts',
        'picker/index': 'src/picker/index.ts',
        'editor/index': 'src/editor/index.ts',
    },
    react: true,
    environment: 'jsdom',
});
