import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import { appMessages } from '@panneau/intl';
import type { ContextParam } from '@panneau/protocol';
import {
    ComboBox,
    type ComboBoxItem,
    IconButton,
    PillTrigger,
    Popover,
    PopoverTrigger,
    Tooltip,
    usePanneauIntl,
} from '@panneau/ui';

import { type CurrentContextValue, useCurrentContext } from '../currentContext';
import { cx } from '../cx';
import styles from './ContextPicker.module.css';

/** Milliseconds between the last key and the search of the choices. */
const SEARCH_DELAY = 250;

/** The id of the choice of no value, for an optional param. */
const NONE = '';

function ParamField({ param, context }: { param: ContextParam; context: CurrentContextValue }) {
    const intl = usePanneauIntl();
    const current = param.value ?? null;
    const currentLabel = current !== null ? (param.valueLabel ?? current) : (param.allLabel ?? '');
    const [input, setInput] = useState(currentLabel);
    // Until the user types, every choice: the input shows the current one.
    const typed = input !== currentLabel ? input.trim() : '';
    const [q, setQ] = useState('');
    useEffect(() => {
        const timeout = window.setTimeout(() => setQ(typed), SEARCH_DELAY);
        return () => window.clearTimeout(timeout);
    }, [typed]);
    const before = context.params
        .slice(
            0,
            context.params.findIndex(({ name }) => name === param.name),
        )
        .map(({ name, value }) => `${name}=${value ?? ''}`)
        .join('&');
    const search = useQuery({
        queryKey: ['panneau', 'context', param.name, before, q],
        queryFn: ({ signal }) => context.getOptions(param.name, q, signal),
        enabled: param.options === undefined,
        staleTime: 30_000,
    });
    const choices =
        param.options?.filter((option) =>
            option.label.toLocaleLowerCase().includes(typed.toLocaleLowerCase()),
        ) ??
        search.data ??
        [];
    const items: ComboBoxItem[] = [
        ...(param.required === true
            ? []
            : [
                  {
                      id: NONE,
                      label: param.allLabel ?? intl.formatMessage(appMessages.contextNone),
                  },
              ]),
        ...choices.map(({ value, label, description }) => ({
            id: value,
            label,
            ...(description !== undefined ? { description } : {}),
        })),
    ];
    // The current value stays a choice while the search finds others
    if (current !== null && !items.some(({ id }) => id === current)) {
        items.push({ id: current, label: currentLabel });
    }
    return (
        <ComboBox
            label={param.label}
            items={items}
            value={current ?? (param.required === true ? null : NONE)}
            inputValue={input}
            onInputChange={setInput}
            placeholder={intl.formatMessage(appMessages.searchPlaceholder)}
            isLoading={search.isFetching || (param.options === undefined && q !== typed)}
            isRequired={param.required === true}
            className={styles.field}
            onChange={(id) => {
                if (id !== null && id !== (current ?? NONE)) {
                    context.select(param.name, id === NONE ? null : id);
                }
            }}
        />
    );
}

export interface ContextPickerProps {
    /** Only the params without a value, on the page that asks for them. */
    missing?: boolean;
    className?: string;
}

/**
 * The fields of the params of the current context (decision 0045), each one with its choices,
 * inline or searched. Picking a value loads the app for it. A param that the backend fixes from
 * the request shows its value, without a field. Renders nothing without a context.
 */
export function ContextPicker({ missing = false, className }: ContextPickerProps) {
    const context = useCurrentContext();
    if (context === null) {
        return null;
    }
    // The params before a missing one stay, to change them.
    const lastMissing = context.params.findIndex(
        ({ required, value }) => required === true && (value ?? null) === null,
    );
    const params = missing ? context.params.slice(0, lastMissing + 1) : context.params;
    return (
        <div className={cx(styles.picker, className)}>
            {params.map((param) =>
                param.fixed === true ? (
                    // Set by the backend from the request, such as its domain: nothing to pick
                    <div key={param.name} className={styles.fixed}>
                        <span className={styles.fixedLabel}>{param.label}</span>
                        <span className={styles.fixedValue}>{param.valueLabel ?? param.value}</span>
                    </div>
                ) : (
                    <ParamField
                        key={`${param.name}:${param.value ?? ''}`}
                        param={param}
                        context={context}
                    />
                ),
            )}
        </div>
    );
}

/** The value of a param, as the user reads it. */
function valueText({ value, valueLabel, allLabel }: ContextParam): string {
    return value !== null && value !== undefined ? (valueLabel ?? value) : (allLabel ?? '—');
}

/** The params of the context and their values: "Client: Acme, Contest: Spring". */
function summarize(context: CurrentContextValue): string {
    return context.params.map((param) => `${param.label}: ${valueText(param)}`).join(', ');
}

/**
 * The current context in the rail of icons: a button whose tooltip says the values, which opens
 * the picker in a popover.
 */
export function ContextPickerButton() {
    const intl = usePanneauIntl();
    const context = useCurrentContext();
    if (context === null) {
        return null;
    }
    const summary = summarize(context);
    const label = intl.formatMessage(appMessages.contextChange, { context: summary });
    return (
        <PopoverTrigger>
            <Tooltip content={summary} placement="end" delay={300}>
                <IconButton icon={ChevronsUpDown} label={label} size="sm" />
            </Tooltip>
            <Popover
                placement="end top"
                aria-label={intl.formatMessage(appMessages.context)}
                className={styles.popover}
            >
                <ContextPicker />
            </Popover>
        </PopoverTrigger>
    );
}

/**
 * The current context in the bar at the top of the dock layout: a pill with the values, which
 * opens the picker in a popover below it.
 */
export function ContextPickerPill({ className }: { className?: string }) {
    const intl = usePanneauIntl();
    const context = useCurrentContext();
    if (context === null) {
        return null;
    }
    const label = intl.formatMessage(appMessages.contextChange, { context: summarize(context) });
    return (
        <PopoverTrigger>
            <PillTrigger size="sm" aria-label={label} className={className}>
                {context.params.map(valueText).join(' · ')}
            </PillTrigger>
            <Popover
                placement="bottom start"
                aria-label={intl.formatMessage(appMessages.context)}
                className={styles.popover}
            >
                <ContextPicker />
            </Popover>
        </PopoverTrigger>
    );
}
