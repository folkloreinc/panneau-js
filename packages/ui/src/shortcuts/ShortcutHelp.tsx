import { use, useSyncExternalStore } from 'react';

import { Dialog } from '../dialog/Dialog';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Switch } from '../switch/Switch';
import styles from './ShortcutHelp.module.css';
import type { RegisteredShortcut } from './registry';
import { ShortcutContext, useFormatShortcut, useRegisteredShortcuts } from './useShortcut';

export interface ShortcutHelpProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const subscribeToNothing = () => () => undefined;

/**
 * The shortcuts registered now, by group, the general ones first: those with the same id, or the
 * same label and keys, once.
 */
function groupShortcuts(
    shortcuts: readonly RegisteredShortcut[],
    general: string,
): [string, RegisteredShortcut[]][] {
    const groups = new Map<string, RegisteredShortcut[]>([[general, []]]);
    const seen = new Set<string>();
    shortcuts.forEach((shortcut) => {
        const id = shortcut.id ?? `${shortcut.label} ${JSON.stringify(shortcut.keys)}`;
        if (seen.has(id)) {
            return;
        }
        seen.add(id);
        const group = shortcut.group ?? general;
        groups.set(group, [...(groups.get(group) ?? []), shortcut]);
    });
    return [...groups].filter(([, items]) => items.length > 0);
}

/**
 * The help of shortcuts (decision 0112): a dialog that lists the shortcuts registered now, by
 * group, with the keys of the platform, and the user's choice about single-key shortcuts. A
 * `PanneauRoot` opens it with `?`, and `useShortcutHelp()` from a menu or a command.
 */
export function ShortcutHelp({ isOpen, onOpenChange }: ShortcutHelpProps) {
    const intl = usePanneauIntl();
    const context = use(ShortcutContext);
    const format = useFormatShortcut();
    const shortcuts = useRegisteredShortcuts();
    const singleKeys = useSyncExternalStore(
        context?.registry.subscribe ?? subscribeToNothing,
        () => context?.registry.getSingleKeys() ?? true,
        () => true,
    );
    const groups = groupShortcuts(shortcuts, intl.formatMessage(messages.shortcutsGeneral));
    return (
        <Dialog
            title={intl.formatMessage(messages.shortcutsTitle)}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <div className={styles.content}>
                {groups.map(([group, items]) => (
                    <section key={group} className={styles.group}>
                        <h3 className={styles.groupTitle}>{group}</h3>
                        <dl className={styles.list}>
                            {items.map((shortcut) => {
                                const { labels } = format(shortcut.keys);
                                return (
                                    <div key={shortcut.id ?? shortcut.label} className={styles.row}>
                                        <dt className={styles.label}>{shortcut.label}</dt>
                                        <dd className={styles.keys}>
                                            {labels.map((label, index) => (
                                                <span key={label} className={styles.combination}>
                                                    {index > 0 ? (
                                                        // Spaces around "or", for those who read the text
                                                        <span className={styles.or}>
                                                            {` ${intl.formatMessage(messages.shortcutsOr)} `}
                                                        </span>
                                                    ) : null}
                                                    <kbd className={styles.kbd}>{label}</kbd>
                                                </span>
                                            ))}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </section>
                ))}
                {context !== null ? (
                    <Switch
                        isSelected={singleKeys}
                        onChange={(enabled) => context.registry.setSingleKeys(enabled)}
                        description={intl.formatMessage(messages.singleKeyShortcutsDescription)}
                    >
                        {intl.formatMessage(messages.singleKeyShortcuts)}
                    </Switch>
                ) : null}
            </div>
        </Dialog>
    );
}
