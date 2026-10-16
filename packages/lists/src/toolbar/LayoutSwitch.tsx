import { LayoutGrid, type LucideIcon, Rows3, Square } from 'lucide-react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';

import { Icon, Tooltip, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import styles from './Toolbar.module.css';

const ICONS: Record<string, LucideIcon> = { table: Rows3, cards: LayoutGrid };

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
    };
    return (
        <ToggleButtonGroup
            aria-label={intl.formatMessage(messages.layout)}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[value]}
            onSelectionChange={(keys) => {
                const [next] = [...keys];
                if (next !== undefined) {
                    onChange(String(next));
                }
            }}
            className={styles.layouts}
        >
            {layouts.map((layout) => {
                const label = labels[layout] ?? layout;
                return (
                    <Tooltip key={layout} content={label}>
                        <ToggleButton
                            id={layout}
                            aria-label={label}
                            className={styles.layoutButton}
                        >
                            <Icon icon={ICONS[layout] ?? Square} />
                        </ToggleButton>
                    </Tooltip>
                );
            })}
        </ToggleButtonGroup>
    );
}
