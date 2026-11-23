import {
    type CalendarDate,
    getLocalTimeZone,
    toCalendarDate,
    today,
} from '@internationalized/date';

import type { DateShortcut as DateShortcutSetting } from '@panneau/protocol';
import { DATE_SHORTCUTS, type DateShortcutName } from '@panneau/protocol/runtime';

import { toCalendarDate as parseDay, toDateTime } from '../shared/dates';

/** A shortcut of the settings, with what it needs to work out its date. */
export interface ResolvedShortcut {
    /** A named shortcut (`today`), whose label the field translates, or the label of the setting. */
    name: DateShortcutName | null;
    label: string;
    /** `2026-10-15`, or `null` while the field it starts from is empty. */
    value: string | null;
}

const OFFSETS = ['years', 'months', 'weeks', 'days'] as const;

function isShortcutName(value: unknown): value is DateShortcutName {
    return (DATE_SHORTCUTS as readonly unknown[]).includes(value);
}

/** The shortcuts of `settings.shortcuts` that are valid, the others left out. */
export function getDateShortcutSettings(
    settings: Record<string, unknown> | undefined,
): DateShortcutSetting[] {
    const shortcuts = settings?.shortcuts;
    if (!Array.isArray(shortcuts)) {
        return [];
    }
    return shortcuts.filter((shortcut: unknown): shortcut is DateShortcutSetting => {
        if (isShortcutName(shortcut)) {
            return true;
        }
        if (typeof shortcut !== 'object' || shortcut === null) {
            return false;
        }
        const { label, from } = shortcut as Record<string, unknown>;
        return (
            typeof label === 'string' &&
            label !== '' &&
            (from === undefined || typeof from === 'string') &&
            OFFSETS.every((unit) => {
                const offset = (shortcut as Record<string, unknown>)[unit];
                return offset === undefined || Number.isInteger(offset);
            })
        );
    });
}

/** The day of a `date` or `datetime` value, in the user's zone. */
function dayOf(value: unknown, zone: string): CalendarDate | null {
    if (typeof value !== 'string') {
        return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        return parseDay(value.trim());
    }
    const date = toDateTime(value, zone);
    return date !== null ? toCalendarDate(date) : null;
}

/**
 * The dates of the shortcuts of a `date` field: today, yesterday, tomorrow, in the user's zone, or
 * a date worked out from today or from the field that `from` names in `parentValue`, `null` while
 * that field is empty.
 */
export function resolveDateShortcuts(
    shortcuts: readonly DateShortcutSetting[],
    parentValue: unknown,
    zone: string = getLocalTimeZone(),
): ResolvedShortcut[] {
    const now = today(zone);
    const siblings =
        typeof parentValue === 'object' && parentValue !== null
            ? (parentValue as Record<string, unknown>)
            : {};
    return shortcuts.map((shortcut) => {
        if (isShortcutName(shortcut)) {
            const days = shortcut === 'yesterday' ? -1 : shortcut === 'tomorrow' ? 1 : 0;
            return { name: shortcut, label: shortcut, value: now.add({ days }).toString() };
        }
        const start = shortcut.from !== undefined ? dayOf(siblings[shortcut.from], zone) : now;
        // Years, then months, weeks and days, as `add` does: January 31 and a month is February 28
        const date =
            start !== null
                ? start.add({
                      years: shortcut.years ?? 0,
                      months: shortcut.months ?? 0,
                      weeks: shortcut.weeks ?? 0,
                      days: shortcut.days ?? 0,
                  })
                : null;
        return { name: null, label: shortcut.label, value: date?.toString() ?? null };
    });
}
