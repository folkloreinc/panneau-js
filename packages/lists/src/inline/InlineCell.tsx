import { Pencil } from 'lucide-react';
import {
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';

import { getProblem } from '@panneau/core';
import { BooleanFieldEntry } from '@panneau/fields/boolean';
import { DateFieldEntry } from '@panneau/fields/date';
import { NumberFieldEntry } from '@panneau/fields/number';
import { SelectFieldEntry } from '@panneau/fields/select';
import { TextFieldEntry } from '@panneau/fields/text';
import type { Field, RuleFailure } from '@panneau/protocol';
import { checkValues } from '@panneau/protocol/runtime';
import { Button, IconButton, Spinner, usePanneauIntl, useToast } from '@panneau/ui';

import { messages } from '../messages';
import type { ListItem } from '../types';
import styles from './Inline.module.css';

const ENTRIES = {
    text: TextFieldEntry,
    number: NumberFieldEntry,
    select: SelectFieldEntry,
    boolean: BooleanFieldEntry,
    date: DateFieldEntry,
} as const;

/** Types that save as soon as a value is picked, rather than on Enter or when leaving the cell. */
const PICKED = new Set(['select', 'date']);

type State =
    | { mode: 'idle' }
    | { mode: 'editing'; draft: unknown; errors: readonly string[] }
    | { mode: 'conflict'; draft: unknown; current: ListItem };

/** The saves of a cell: the one in flight, and the value to save after it. */
interface Saves {
    /** The value to save once the save in flight is answered, the last one picked. */
    next: { value: unknown } | null;
    /** The value before the first of these saves, that "Undo" puts back. */
    previous: unknown;
    /** The value the backend last saved. */
    saved: unknown;
}

export interface InlineCellProps {
    item: ListItem;
    /** The field the cell edits, of a type of `INLINE_TYPES`. */
    field: Field;
    /** The label of the item, for the name of the edit button. */
    itemLabel: string;
    /** The label of an item the backend gave back, for the toast that says it was saved. */
    getItemLabel?: (item: ListItem) => string;
    /** The content of the cell when it doesn't edit: the value, or the title's link. */
    children: ReactNode;
    /** Renders a value of the field, for the current value of a conflict. */
    renderValue: (item: ListItem) => ReactNode;
    /** Saves the value on an item (the current one after a conflict), with its version. */
    onSave: (item: ListItem, value: unknown) => Promise<ListItem>;
    /**
     * Shows an item: with the value being saved, at once, then as the backend gave it back
     * (saved, or changed by someone else), or with the value back when the save failed.
     */
    onItem: (item: ListItem) => void;
    formatError: (failure: RuleFailure) => string;
}

function isEqualValue(a: unknown, b: unknown): boolean {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/**
 * A cell that edits its field in place (decision 0043): a checkbox for a boolean, otherwise the
 * value with a button that turns it into the field's control. Enter or leaving the cell saves,
 * Escape cancels; a select and a date save when one is picked. The value is checked by the
 * field's portable rules, then saved alone, and shows at once: the cell stays usable while it
 * saves. Errors and conflicts show in the cell.
 */
export function InlineCell({
    item,
    field,
    itemLabel,
    getItemLabel,
    children,
    renderValue,
    onSave,
    onItem,
    formatError,
}: InlineCellProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const [state, setState] = useState<State>({ mode: 'idle' });
    const [sending, setSending] = useState(false);
    const saves = useRef<Saves | null>(null);
    // The item as the list shows it now, for what a save does once it is answered.
    const latest = useRef(item);
    useEffect(() => {
        latest.current = item;
    });
    const root = useRef<HTMLDivElement>(null);
    // Where focus goes once the cell has drawn its new state.
    const focus = useRef<'editor' | 'button' | null>(null);
    const label = field.label ?? field.name;
    const value = item[field.name];
    const isBoolean = field.type === 'boolean';
    const Entry = ENTRIES[field.type as keyof typeof ENTRIES];
    // The help of the field is for its form: a cell has no room for it.
    const { help: _help, ...bare } = field;

    useEffect(() => {
        if (focus.current === 'editor') {
            root.current?.querySelector<HTMLElement>('input, [role="spinbutton"], button')?.focus();
        } else if (focus.current === 'button') {
            root.current?.querySelector<HTMLElement>('button')?.focus();
        }
        focus.current = null;
    });

    // Whether the focus is still in the cell, or nowhere: a cell that answers late doesn't take
    // the focus from where the user went meanwhile.
    const hasFocus = () => {
        const active = document.activeElement;
        return (
            active === null || active === document.body || (root.current?.contains(active) ?? false)
        );
    };

    /**
     * Sends a value, then the one picked while it was sent, if any, on the item the first save
     * gave back: with its version, so that it doesn't conflict with the first.
     */
    const send = (base: ListItem, draft: unknown, undoing: boolean) => {
        onSave(base, draft).then(
            (saved) => {
                const current = saves.current;
                const next = current?.next ?? null;
                if (current !== null && next !== null) {
                    current.saved = saved[field.name];
                    current.next = null;
                    if (!isEqualValue(next.value, saved[field.name])) {
                        onItem({ ...saved, [field.name]: next.value });
                        send(saved, next.value, false);
                        return;
                    }
                }
                saves.current = null;
                setSending(false);
                onItem(saved);
                const names = { item: getItemLabel?.(saved) ?? itemLabel, field: label };
                const key = { key: `panneau-inline:${item.id}:${field.name}` };
                const previous = current?.previous;
                toasts.show(
                    undoing
                        ? { title: intl.formatMessage(messages.inlineUndone, names) }
                        : {
                              title: intl.formatMessage(messages.inlineSaved, names),
                              tone: 'success',
                              action: {
                                  label: intl.formatMessage(messages.undo),
                                  onAction: () => save(saved, previous, { undoing: true }),
                              },
                          },
                    key,
                );
            },
            (error: unknown) => {
                const current = saves.current;
                // The value picked last, which the cell offers to save again.
                const wanted = current?.next?.value ?? draft;
                saves.current = null;
                setSending(false);
                const problem = getProblem(error);
                if (problem?.status === 412 && problem.current !== undefined) {
                    onItem(problem.current);
                    setState({ mode: 'conflict', draft: wanted, current: problem.current });
                    return;
                }
                // The value goes back to what the backend has.
                onItem({ ...latest.current, [field.name]: current?.saved ?? base[field.name] });
                const own = Object.entries(problem?.errors ?? {})
                    .filter(([path]) => path === field.name || path.startsWith(`${field.name}.`))
                    .flatMap(([, list]) => list);
                const message =
                    problem?.detail ??
                    (problem !== null ? problem.title : null) ??
                    (error instanceof Error && error.message !== '' ? error.message : null) ??
                    intl.formatMessage(messages.saveValueFailed);
                focus.current = hasFocus() ? 'editor' : null;
                setState({
                    mode: 'editing',
                    draft: wanted,
                    errors: own.length > 0 ? own : [message],
                });
            },
        );
    };

    /**
     * Saves a value on an item, and shows it at once: the cell stays usable while it saves. A
     * value picked while a save is in flight is saved after it. When the save fails, the value
     * goes back and the cell says why. The toast that says it was saved has "Undo", which saves
     * the value from before the saves the same way, with the version the save just got (decision
     * 0063): a conflict then shows in the cell, as for any change. After an undo, a short toast
     * says the value is back.
     */
    const save = (base: ListItem, draft: unknown, { undoing = false } = {}) => {
        setState({ mode: 'idle' });
        onItem({ ...base, [field.name]: draft });
        if (saves.current !== null) {
            saves.current.next = { value: draft };
            return;
        }
        saves.current = {
            next: null,
            previous: base[field.name],
            saved: base[field.name],
        };
        setSending(true);
        send(base, draft, undoing);
    };

    const commit = (draft: unknown, { leaving = false } = {}) => {
        if (isEqualValue(draft, value)) {
            focus.current = 'button';
            setState({ mode: 'idle' });
            return;
        }
        const failures = checkValues(
            [field],
            { [field.name]: draft },
            {
                mode: 'update',
                partial: true,
                item,
            },
        );
        const errors = Object.values(failures)
            .flat()
            .map((failure) => formatError(failure));
        if (errors.length > 0) {
            setState({ mode: 'editing', draft, errors });
            return;
        }
        focus.current = isBoolean || leaving ? null : 'button';
        save(item, draft);
    };

    const cancel = () => {
        focus.current = 'button';
        setState({ mode: 'idle' });
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (state.mode !== 'editing') {
            return;
        }
        if (event.key === 'Escape') {
            event.stopPropagation();
            cancel();
        } else if (event.key === 'Enter' && !PICKED.has(field.type)) {
            event.preventDefault();
            commit(state.draft);
        }
    };

    // Leaving the cell saves; the popover of a select or a date picker is part of it.
    const onBlur = (event: FocusEvent) => {
        const next = event.relatedTarget;
        if (
            state.mode !== 'editing' ||
            (next instanceof Element &&
                (event.currentTarget.contains(next) || next.closest('.panneau-popover') !== null))
        ) {
            return;
        }
        commit(state.draft, { leaving: true });
    };

    // The control stays usable while a value saves: a value picked meanwhile is saved after it.
    const control = (draft: unknown, errors: readonly string[]) => (
        <Entry
            field={bare}
            path={field.name}
            value={draft}
            onChange={(next) => {
                if (isBoolean || (PICKED.has(field.type) && next !== null)) {
                    commit(next);
                } else {
                    setState({ mode: 'editing', draft: next, errors: [] });
                }
            }}
            errors={errors}
            hideLabel
        />
    );

    if (isBoolean) {
        return (
            <div className={styles.cell}>
                <div className={styles.control}>
                    {control(value, state.mode === 'editing' ? state.errors : [])}
                    {sending ? (
                        <Spinner size="sm" label={intl.formatMessage(messages.savingValue)} />
                    ) : null}
                </div>
                {state.mode === 'conflict' ? (
                    <Conflict
                        current={renderValue(state.current)}
                        onKeep={() => setState({ mode: 'idle' })}
                        onSave={() => save(state.current, state.draft)}
                    />
                ) : null}
            </div>
        );
    }

    if (state.mode === 'idle') {
        return (
            <div ref={root} className={styles.cell}>
                <span className={styles.value}>{children}</span>
                {sending ? (
                    <Spinner size="sm" label={intl.formatMessage(messages.savingValue)} />
                ) : null}
                <IconButton
                    icon={Pencil}
                    size="sm"
                    label={intl.formatMessage(messages.editValue, {
                        field: label,
                        item: itemLabel,
                    })}
                    showTooltip={false}
                    className={styles.edit}
                    onPress={() => {
                        focus.current = 'editor';
                        setState({ mode: 'editing', draft: value, errors: [] });
                    }}
                />
            </div>
        );
    }

    return (
        <div ref={root} className={styles.cell} onKeyDown={onKeyDown} onBlur={onBlur}>
            <div className={styles.control}>
                {control(state.draft, state.mode === 'editing' ? state.errors : [])}
                {sending ? (
                    <Spinner size="sm" label={intl.formatMessage(messages.savingValue)} />
                ) : null}
            </div>
            {state.mode === 'conflict' ? (
                <Conflict
                    current={renderValue(state.current)}
                    onKeep={() => {
                        focus.current = 'button';
                        setState({ mode: 'idle' });
                    }}
                    onSave={() => save(state.current, state.draft)}
                />
            ) : null}
        </div>
    );
}

/** What someone else saved, with the choice of keeping it or saving over it. */
function Conflict({
    current,
    onKeep,
    onSave,
}: {
    current: ReactNode;
    onKeep: () => void;
    onSave: () => void;
}) {
    const intl = usePanneauIntl();
    return (
        <div className={styles.conflict} role="alert">
            <span>
                {intl.formatMessage(messages.valueConflict)} <strong>{current}</strong>
            </span>
            <span className={styles.conflictActions}>
                <Button size="sm" appearance="ghost" onPress={onKeep}>
                    {intl.formatMessage(messages.keepTheirs)}
                </Button>
                <Button size="sm" onPress={onSave}>
                    {intl.formatMessage(messages.saveMine)}
                </Button>
            </span>
        </div>
    );
}
