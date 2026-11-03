import { ChevronLeft, ChevronRight } from 'lucide-react';

import { currentMonth, isMonth, shiftMonth } from '@panneau/core';
import { Button, IconButton, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListItem, ListLayoutProps } from '../types';
import styles from './CalendarLayout.module.css';
import { ItemTitle } from './ItemTitle';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number, length = 2): string {
    return String(value).padStart(length, '0');
}

function dayOf(date: Date): string {
    return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** The day of a `date` (as it is) or a `datetime` (in the time zone of the browser). */
function getItemDay(value: unknown): string | null {
    if (typeof value !== 'string' || value === '') {
        return null;
    }
    if (DAY.test(value)) {
        return value;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The first day of the week in a locale: 1 for Monday to 7 for Sunday. */
function getFirstDay(locale: string): number {
    try {
        const info = new Intl.Locale(locale) as Intl.Locale & {
            getWeekInfo?: () => { firstDay: number };
            weekInfo?: { firstDay: number };
        };
        return info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay ?? 1;
    } catch {
        return 1;
    }
}

/** The weeks that show a month, as days (`2026-11-02`), from the first day of the week. */
function getWeeks(month: string, firstDay: number): string[][] {
    const [year = 1970, index = 1] = month.split('-').map(Number);
    const first = new Date(Date.UTC(year, index - 1, 1));
    const last = new Date(Date.UTC(year, index, 0));
    // getUTCDay(): 0 for Sunday; firstDay: 7 for Sunday.
    const offset = (first.getUTCDay() - (firstDay % 7) + 7) % 7;
    const start = Date.UTC(year, index - 1, 1 - offset);
    const days: string[] = [];
    for (let time = start; days.length % 7 !== 0 || time <= last.getTime(); time += 86_400_000) {
        days.push(dayOf(new Date(time)));
    }
    return Array.from({ length: days.length / 7 }, (_, week) => days.slice(week * 7, week * 7 + 7));
}

/**
 * Items on the days of a month (decision 0044): the weeks of the month, from the first day of the
 * week of the locale, with the title of each item as its link, in the order of their dates, and
 * buttons to the previous, the next and the current month. On narrow lists, the days that have
 * items, one under the other.
 */
export function CalendarLayout({
    items,
    columns,
    renderValue,
    getItemLabel,
    getItemHref,
    isCurrent,
    label,
    calendar,
}: ListLayoutProps) {
    const intl = usePanneauIntl();
    const today = currentMonth();
    const month = calendar !== undefined && isMonth(calendar.month) ? calendar.month : today;
    const [year = 1970, index = 1] = month.split('-').map(Number);
    const [title] = columns;
    const weeks = getWeeks(month, getFirstDay(intl.locale));
    const monthLabel = new Intl.DateTimeFormat(intl.locale, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, index - 1, 1)));
    const dayLabel = new Intl.DateTimeFormat(intl.locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
    });
    const weekday = (format: 'short' | 'long') =>
        new Intl.DateTimeFormat(intl.locale, { weekday: format, timeZone: 'UTC' });
    const now = new Date();
    const todayDay = `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const byDay = new Map<string, { item: ListItem; value: string }[]>();
    if (calendar !== undefined) {
        items.forEach((item) => {
            const value = item[calendar.field];
            const day = getItemDay(value);
            if (day !== null) {
                byDay.set(day, [...(byDay.get(day) ?? []), { item, value: String(value) }]);
            }
        });
    }
    const more = calendar?.more ?? null;

    return (
        <div className={styles.calendar}>
            <div className={styles.header}>
                <p className={styles.month} aria-live="polite">
                    {monthLabel}
                </p>
                <div className={styles.navigation}>
                    <IconButton
                        icon={ChevronLeft}
                        label={intl.formatMessage(messages.previousMonth)}
                        onPress={() => calendar?.onMonthChange(shiftMonth(month, -1))}
                    />
                    <Button
                        size="sm"
                        isDisabled={month === today}
                        onPress={() => calendar?.onMonthChange(today)}
                    >
                        {intl.formatMessage(messages.thisMonth)}
                    </Button>
                    <IconButton
                        icon={ChevronRight}
                        label={intl.formatMessage(messages.nextMonth)}
                        onPress={() => calendar?.onMonthChange(shiftMonth(month, 1))}
                    />
                </div>
            </div>
            {more !== null ? (
                <p className={styles.more} role="status">
                    {more.total !== null
                        ? intl.formatMessage(messages.calendarMore, {
                              shown: items.length,
                              total: more.total,
                          })
                        : intl.formatMessage(messages.calendarMoreUnknown, {
                              shown: items.length,
                          })}
                </p>
            ) : null}
            <table className={styles.grid} aria-label={`${label}, ${monthLabel}`}>
                <thead>
                    <tr>
                        {(weeks[0] ?? []).map((day) => {
                            const date = new Date(`${day}T00:00:00Z`);
                            return (
                                <th key={day} scope="col">
                                    <abbr title={weekday('long').format(date)}>
                                        {weekday('short').format(date)}
                                    </abbr>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week) => (
                        <tr key={week[0]}>
                            {week.map((day) => {
                                const entries = [...(byDay.get(day) ?? [])].sort((a, b) =>
                                    a.value.localeCompare(b.value),
                                );
                                return (
                                    <td
                                        key={day}
                                        data-outside={!day.startsWith(month) || undefined}
                                        data-empty={entries.length === 0 || undefined}
                                        aria-current={day === todayDay ? 'date' : undefined}
                                    >
                                        <time dateTime={day} className={styles.day}>
                                            <span aria-hidden="true" className={styles.dayNumber}>
                                                {Number(day.slice(8))}
                                            </span>
                                            <span className={styles.dayLabel}>
                                                {dayLabel.format(new Date(`${day}T00:00:00Z`))}
                                            </span>
                                        </time>
                                        {entries.length > 0 ? (
                                            <ul className={styles.items}>
                                                {entries.map(({ item }) => (
                                                    <li
                                                        key={item.id}
                                                        data-current={
                                                            isCurrent?.(item) === true || undefined
                                                        }
                                                    >
                                                        <ItemTitle
                                                            href={getItemHref?.(item) ?? null}
                                                            current={isCurrent?.(item) ?? false}
                                                        >
                                                            {title !== undefined
                                                                ? renderValue(item, title)
                                                                : getItemLabel(item)}
                                                        </ItemTitle>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
