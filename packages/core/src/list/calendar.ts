const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;
/** Days before and after a month that a calendar asks for: weeks start on any day. */
const PADDING = 6;

function pad(value: number, length = 2): string {
    return String(value).padStart(length, '0');
}

function toDay(date: Date): string {
    return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Whether a value is a month, as the view of a calendar keeps it (`2026-11`). */
export function isMonth(value: unknown): value is string {
    return typeof value === 'string' && MONTH.test(value);
}

/** The month of a day, in the time zone of the browser (`2026-11`). Defaults to today. */
export function currentMonth(now: Date = new Date()): string {
    return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}`;
}

/** The month `offset` months after another one (`-1` for the previous one). */
export function shiftMonth(month: string, offset: number): string {
    const [, year = '1970', index = '01'] = MONTH.exec(month) ?? [];
    const date = new Date(Date.UTC(Number(year), Number(index) - 1 + offset, 1));
    return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}`;
}

/**
 * The days a calendar asks for to show a month (decision 0044): from 6 days before its first day
 * to 6 days after its last, so that the weeks shown are covered whatever day they start on.
 */
export function getCalendarRange(month: string): { from: string; to: string } {
    const [, year = '1970', index = '01'] = MONTH.exec(month) ?? [];
    const first = Date.UTC(Number(year), Number(index) - 1, 1);
    const last = Date.UTC(Number(year), Number(index), 0);
    const day = 86_400_000;
    return {
        from: toDay(new Date(first - PADDING * day)),
        to: toDay(new Date(last + PADDING * day)),
    };
}
