import { definePackageConfig } from '../../config/vite.package.ts';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: {
        index: 'src/index.ts',
        'locales/index': 'src/locales/index.ts',
        'theme/index': 'src/theme/index.ts',
        'theme/cli': 'src/theme/cli.ts',
    },
    react: true,
    environment: 'jsdom',
});
