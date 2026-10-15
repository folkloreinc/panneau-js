import { definePackageConfig } from '../../config/vite.package.ts';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: {
        index: 'src/index.ts',
        'locales/index': 'src/locales/index.ts',
    },
    react: true,
    environment: 'jsdom',
});
