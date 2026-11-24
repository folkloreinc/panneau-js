import { ArrowDownUp, CornerDownLeft, Search, X } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import {
    Autocomplete,
    Button,
    Dialog,
    Header,
    Input,
    Keyboard,
    Menu,
    MenuItem,
    MenuSection,
    Modal,
    ModalOverlay,
    SearchField,
    Text,
} from 'react-aria-components';

import { IconButton } from '../icon-button/IconButton';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { usePortalContainer } from '../root/PanneauRoot';
import { useShortcut, useShortcutHint } from '../shortcuts/useShortcut';
import { cx } from '../utils/cx';
import styles from './CommandPalette.module.css';
import { type CommandPaletteGroup, matchCommands, splitMatches } from './match';
import { COMMAND_PALETTE_KEYS } from './useCommandShortcut';

export interface CommandPaletteProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    /**
     * The groups of items. The palette matches them with the query itself, except groups that
     * are already `matched`, such as results of a server, which come after the others.
     */
    groups: readonly CommandPaletteGroup[];
    /** The query, controlled: to search a server with it. Empty each time the palette opens. */
    inputValue?: string;
    onInputChange?: (value: string) => void;
    /** Accessible name of the palette and its field. Defaults to "Search". */
    'aria-label'?: string;
    placeholder?: string;
    /** A line under the results, and in place of them when there are none: loading or failed
     * results of a server, a query too short to search. */
    status?: ReactNode;
    /**
     * What the search is narrowed to, such as one resource, shown as a chip before the field.
     * Backspace in the empty field, or the chip's button, calls `onScopeRemove`.
     */
    scope?: string | null;
    onScopeRemove?: () => void;
    /**
     * Highlights, in the label of each item, the first match of each word of the query, ignoring
     * case and accents. Screen readers read the label as it is.
     */
    highlightMatches?: boolean;
    className?: string;
}

/**
 * A label with what matches the query in `<mark>`. The marks are presentational: screen readers
 * read the label once, as it is.
 */
function Highlighted({ label, query, locale }: { label: string; query: string; locale: string }) {
    return splitMatches(label, query, locale).map((part, index) =>
        part.match ? (
            // The parts of a label keep their order
            <mark key={index} role="presentation" className={styles.match}>
                {part.text}
            </mark>
        ) : (
            part.text
        ),
    );
}

/**
 * A command palette: a search field over groups of items to go to or run, in a dialog near the top
 * of the screen. Typing matches the items without case or accents, every word having to match,
 * the best matches first. Arrow keys move through the items, Enter opens one and closes the
 * palette, Escape clears the field, then closes it. A `scope` narrows what it searches, as a chip
 * before the field. `highlightMatches` marks what matches in labels. It knows no data or router: links go through
 * the app's `RouterProvider`. `useCommandShortcut()` opens it with ⌘K or Ctrl+K, and the same keys
 * close it.
 */
export function CommandPalette({
    isOpen,
    onOpenChange,
    groups,
    inputValue: controlledValue,
    onInputChange,
    'aria-label': ariaLabel,
    placeholder,
    status,
    scope = null,
    onScopeRemove,
    highlightMatches = false,
    className,
}: CommandPaletteProps) {
    const intl = usePanneauIntl();
    const container = usePortalContainer();
    const hint = useShortcutHint();
    const [uncontrolledValue, setUncontrolledValue] = useState('');
    const value = controlledValue ?? uncontrolledValue;
    const setValue = (next: string) => {
        setUncontrolledValue(next);
        onInputChange?.(next);
    };
    const label = ariaLabel ?? intl.formatMessage(messages.commandPalette);
    const visible = matchCommands(groups, value, intl.locale);
    const count = visible.reduce((total, group) => total + group.items.length, 0);

    const changeOpen = (open: boolean) => {
        if (!open) {
            setValue('');
        }
        onOpenChange(open);
    };
    // The keys that open it close it (`useCommandShortcut()`)
    const dialog = useRef<HTMLElement>(null);
    useShortcut({
        id: 'panneau.goTo',
        keys: COMMAND_PALETTE_KEYS,
        label,
        scope: dialog,
        enabled: isOpen,
        perform: () => changeOpen(false),
    });

    if (container === null) {
        return null;
    }
    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={changeOpen}
            isDismissable
            className={styles.overlay}
            UNSTABLE_portalContainer={container}
        >
            <Modal className={styles.modal}>
                <Dialog
                    ref={dialog}
                    aria-label={label}
                    className={cx('panneau-command-palette', styles.dialog, className)}
                >
                    <Autocomplete inputValue={value} onInputChange={setValue}>
                        <div className={styles.field}>
                            <SearchField
                                aria-label={scope !== null ? `${label}: ${scope}` : label}
                                autoFocus
                                className={styles.search}
                            >
                                <Icon icon={Search} size="md" className={styles.fieldIcon} />
                                {scope !== null ? (
                                    <span className={styles.scope}>
                                        <span className={styles.scopeLabel}>{scope}</span>
                                        <Button
                                            aria-label={intl.formatMessage(
                                                messages.commandRemoveScope,
                                                { scope },
                                            )}
                                            className={styles.scopeRemove}
                                            onPress={onScopeRemove}
                                        >
                                            <Icon icon={X} size="xs" />
                                        </Button>
                                    </span>
                                ) : null}
                                <Input
                                    placeholder={placeholder ?? label}
                                    className={styles.input}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Backspace' &&
                                            value === '' &&
                                            scope !== null
                                        ) {
                                            event.preventDefault();
                                            onScopeRemove?.();
                                        }
                                    }}
                                />
                            </SearchField>
                            {/* Touch screens have no Escape key. */}
                            <IconButton
                                icon={X}
                                label={intl.formatMessage(messages.close)}
                                size="sm"
                                showTooltip={false}
                                className={styles.close}
                                onPress={() => changeOpen(false)}
                            />
                        </div>
                        <Menu
                            aria-label={label}
                            className={styles.list}
                            // Without results, the status says why: loading, failed, too short…
                            renderEmptyState={() => (
                                <p className={styles.empty}>
                                    {status ??
                                        intl.formatMessage(messages.commandResults, { count: 0 })}
                                </p>
                            )}
                        >
                            {visible.map((group) => (
                                <MenuSection key={group.id} id={group.id} className={styles.group}>
                                    <Header className={styles.groupLabel}>{group.label}</Header>
                                    {group.items.map((item) => (
                                        <MenuItem
                                            key={item.id}
                                            id={`${group.id}:${item.id}`}
                                            textValue={item.label}
                                            href={item.href}
                                            onAction={() => {
                                                item.onAction?.();
                                                if (item.keepsOpen !== true) {
                                                    changeOpen(false);
                                                }
                                            }}
                                            className={styles.item}
                                        >
                                            {item.imageUrl !== undefined ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt=""
                                                    className={styles.image}
                                                />
                                            ) : (
                                                <span className={styles.icon} aria-hidden="true">
                                                    {item.icon !== undefined ? (
                                                        <Icon icon={item.icon} size="md" />
                                                    ) : null}
                                                </span>
                                            )}
                                            <span className={styles.text}>
                                                <Text slot="label" className={styles.label}>
                                                    {highlightMatches ? (
                                                        <Highlighted
                                                            label={item.label}
                                                            query={value}
                                                            locale={intl.locale}
                                                        />
                                                    ) : (
                                                        item.label
                                                    )}
                                                </Text>
                                                {item.description !== undefined ? (
                                                    <Text
                                                        slot="description"
                                                        className={styles.description}
                                                    >
                                                        {item.description}
                                                    </Text>
                                                ) : null}
                                            </span>
                                            {item.shortcut !== undefined &&
                                            hint(item.shortcut) !== null ? (
                                                <Keyboard className={styles.shortcut}>
                                                    {hint(item.shortcut)}
                                                </Keyboard>
                                            ) : null}
                                        </MenuItem>
                                    ))}
                                </MenuSection>
                            ))}
                        </Menu>
                    </Autocomplete>
                    <div className={styles.footer}>
                        <span className={styles.status} role="status">
                            {status ?? intl.formatMessage(messages.commandResults, { count })}
                        </span>
                        <span className={styles.hints} aria-hidden="true">
                            <span className={styles.hint}>
                                <kbd className={styles.key}>
                                    <Icon icon={ArrowDownUp} size="xs" />
                                </kbd>
                                {intl.formatMessage(messages.commandHintMove)}
                            </span>
                            <span className={styles.hint}>
                                <kbd className={styles.key}>
                                    <Icon icon={CornerDownLeft} size="xs" />
                                </kbd>
                                {intl.formatMessage(messages.commandHintOpen)}
                            </span>
                            <span className={styles.hint}>
                                <kbd className={styles.key}>esc</kbd>
                                {intl.formatMessage(messages.commandHintClose)}
                            </span>
                        </span>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
