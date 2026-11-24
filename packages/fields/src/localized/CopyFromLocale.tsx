import { Copy } from 'lucide-react';

import { Button, Menu, MenuItem, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { messages } from '../shared/messages';
import styles from './LocalizedField.module.css';
import { useLocaleName } from './localeName';

export interface CopyFromLocaleProps {
    /** The filled locales the shown one can be copied from. */
    sources: readonly string[];
    onCopy: (source: string) => void;
}

/**
 * "Copy from …" next to the switch of a localized field, for an empty locale: a button for a
 * single filled locale, a menu of them for several. In a narrow field (a phone, a sidebar), only
 * its icon, so that the switch stays on the line of the label (#501).
 */
export function CopyFromLocale({ sources, onCopy }: CopyFromLocaleProps) {
    const intl = usePanneauIntl();
    const localeName = useLocaleName();
    const [only] = sources.length === 1 ? sources : [];
    const label =
        only !== undefined
            ? intl.formatMessage(messages.copyFromLocale, { locale: localeName(only) })
            : intl.formatMessage(messages.copyFromLocales);
    // Its label is hidden in a narrow field, where it stays its accessible name (see the CSS).
    const button = (onPress?: () => void) => (
        <Button
            size="sm"
            appearance="ghost"
            icon={Copy}
            className={styles.copy}
            {...(onPress !== undefined ? { onPress } : {})}
        >
            <span className={styles.copyLabel}>{label}</span>
        </Button>
    );
    if (only !== undefined) {
        return button(() => onCopy(only));
    }
    return (
        <MenuTrigger>
            {button()}
            <Menu aria-label={label} placement="bottom end" onAction={(key) => onCopy(String(key))}>
                {sources.map((source) => (
                    <MenuItem key={source} id={source}>
                        {localeName(source)}
                    </MenuItem>
                ))}
            </Menu>
        </MenuTrigger>
    );
}
