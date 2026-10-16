import { definePackageConfig } from '../../config/vite.package.ts';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: {
        index: 'src/index.ts',
        'text/index': 'src/text/index.ts',
        'textarea/index': 'src/textarea/index.ts',
        'number/index': 'src/number/index.ts',
        'boolean/index': 'src/boolean/index.ts',
        'date/index': 'src/date/index.ts',
        'datetime/index': 'src/datetime/index.ts',
        'time/index': 'src/time/index.ts',
        'select/index': 'src/select/index.ts',
        'email/index': 'src/email/index.ts',
        'url/index': 'src/url/index.ts',
        'color/index': 'src/color/index.ts',
        'slug/index': 'src/slug/index.ts',
        'localized/index': 'src/localized/index.ts',
        'group/index': 'src/group/index.ts',
        'repeater/index': 'src/repeater/index.ts',
        'relation/index': 'src/relation/index.ts',
        'locales/index': 'src/locales/index.ts',
    },
    react: true,
    environment: 'jsdom',
});
