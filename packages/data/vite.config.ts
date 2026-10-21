import { definePackageConfig } from '../../config/vite.package.ts';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: {
        index: 'src/index.ts',
        'laravel/index': 'src/laravel/index.ts',
        'query/index': 'src/query/index.ts',
        'uploads/index': 'src/uploads/index.ts',
    },
    react: true,
    environment: 'jsdom',
});
