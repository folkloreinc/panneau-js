import type { ComponentType } from 'react';

// The kinds that the tests of `@panneau/core` give, which other packages declare (decision 0097).
declare module '../plugins' {
    interface PluginKinds {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any component, in tests
        fields: ComponentType<any>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any component, in tests
        displays: ComponentType<any>;
    }
}
