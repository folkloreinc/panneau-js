import { CalendarDays, Images, LayoutGrid, type LucideIcon, Rows3, Square } from 'lucide-react';

import { SegmentedControl, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';

const ICONS: Record<string, LucideIcon> = {
    table: Rows3,
    cards: LayoutGrid,
    gallery: Images,
    calendar: CalendarDays,
};

export interface LayoutSwitchProps {
    layouts: readonly string[];
    value: string;
    onChange: (layout: string) => void;
}

/** Buttons to show the items as a table, as cards, or in a plugin's layout. */
export function LayoutSwitch({ layouts, value, onChange }: LayoutSwitchProps) {
    const intl = usePanneauIntl();
    const labels: Record<string, string> = {
        table: intl.formatMessage(messages.layoutTable),
        cards: intl.formatMessage(messages.layoutCards),
        gallery: intl.formatMessage(messages.layoutGallery),
        calendar: intl.formatMessage(messages.layoutCalendar),
    };
    return (
        <SegmentedControl
            aria-label={intl.formatMessage(messages.layout)}
            hideLabels
            options={layouts.map((layout) => ({
                value: layout,
                label: labels[layout] ?? layout,
                icon: ICONS[layout] ?? Square,
            }))}
            value={value}
            onChange={onChange}
        />
    );
}
