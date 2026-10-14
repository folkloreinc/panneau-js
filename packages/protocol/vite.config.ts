import { definePackageConfig } from '../../config/vite.package';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: { index: 'src/index.ts' },
});
