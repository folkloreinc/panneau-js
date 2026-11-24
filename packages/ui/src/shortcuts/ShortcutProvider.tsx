import { type ReactNode, Suspense, lazy, use, useEffect, useState } from 'react';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { readPreference, writePreference } from '../utils/preference';
import { type ShortcutRegistry, createShortcutRegistry } from './registry';
import { ShortcutContext, type ShortcutContextValue, useShortcut } from './useShortcut';

// The help is loaded when it first opens
const ShortcutHelp = lazy(async () => ({
    default: (await import('./ShortcutHelp')).ShortcutHelp,
}));

/** The preference of single-key shortcuts (`panneau:single-key-shortcuts`). */
export const SINGLE_KEYS_PREFERENCE = 'single-key-shortcuts';
export const SINGLE_KEYS_STATES = ['on', 'off'] as const;

function createRegistry(): ShortcutRegistry {
    return createShortcutRegistry({
        singleKeys: readPreference(SINGLE_KEYS_PREFERENCE, SINGLE_KEYS_STATES) !== 'off',
        onSingleKeysChange: (enabled) =>
            writePreference(SINGLE_KEYS_PREFERENCE, enabled ? 'on' : 'off'),
    });
}

/** `?` opens the help. */
function HelpShortcut({ onOpen }: { onOpen: () => void }) {
    const intl = usePanneauIntl();
    useShortcut({
        id: 'panneau.help',
        keys: '?',
        label: intl.formatMessage(messages.shortcutsHelp),
        perform: onOpen,
    });
    return null;
}

/**
 * The registry of shortcuts of a `PanneauRoot`, with its listener on the document and its help
 * (`?`). A root inside another one uses the outer registry.
 */
export function ShortcutProvider({ children }: { children: ReactNode }) {
    const outer = use(ShortcutContext);
    const [helpOpen, setHelpOpen] = useState(false);
    const [helpLoaded, setHelpLoaded] = useState(false);
    // One value for the life of the root: shortcuts register again when it changes
    const [value] = useState<ShortcutContextValue>(() => ({
        registry: createRegistry(),
        openHelp: () => {
            setHelpLoaded(true);
            setHelpOpen(true);
        },
    }));
    useEffect(() => {
        if (outer !== null) {
            return undefined;
        }
        return value.registry.listen(document);
    }, [outer, value]);
    if (outer !== null) {
        return children;
    }
    return (
        <ShortcutContext value={value}>
            <HelpShortcut onOpen={value.openHelp} />
            {children}
            {helpLoaded ? (
                <Suspense fallback={null}>
                    <ShortcutHelp isOpen={helpOpen} onOpenChange={setHelpOpen} />
                </Suspense>
            ) : null}
        </ShortcutContext>
    );
}
