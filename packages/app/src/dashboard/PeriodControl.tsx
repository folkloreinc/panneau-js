import { appMessages } from '@panneau/intl';
import type { Widget } from '@panneau/protocol';
import { type OverviewPeriodOption, isOverviewPeriod } from '@panneau/protocol/runtime';
import { SegmentedControl, usePanneauIntl } from '@panneau/ui';

import styles from './Dashboard.module.css';

const LABELS = {
    '7d': appMessages.period7d,
    '30d': appMessages.period30d,
    '90d': appMessages.period90d,
    month: appMessages.periodMonth,
    year: appMessages.periodYear,
} satisfies Record<OverviewPeriodOption, unknown>;

export interface PeriodControlProps {
    /** The options of the period of the overview, in order. */
    options: readonly string[];
    /** The chosen option, or `null` for a range that isn't one of them. */
    value: OverviewPeriodOption | null;
    onChange: (option: OverviewPeriodOption) => void;
    /** The widgets of the overview, and those that follow the period. */
    widgets: readonly Widget[];
    following: readonly Widget[];
}

/**
 * The period of an overview (decision 0084): a segmented control of its options. When some of its
 * widgets don't follow it, it lists those it changes.
 */
export function PeriodControl({
    options,
    value,
    onChange,
    widgets,
    following,
}: PeriodControlProps) {
    const intl = usePanneauIntl();
    const partial = following.length > 0 && following.length < widgets.length;
    return (
        <div className={styles.period}>
            <SegmentedControl
                size="sm"
                aria-label={intl.formatMessage(appMessages.period)}
                options={options.filter(isOverviewPeriod).map((option) => ({
                    value: option,
                    label: intl.formatMessage(LABELS[option]),
                }))}
                value={value ?? ''}
                onChange={(option) => {
                    if (isOverviewPeriod(option)) {
                        onChange(option);
                    }
                }}
            />
            {partial ? (
                <p className={styles.periodHelp}>
                    {intl.formatMessage(appMessages.periodAppliesTo, {
                        widgets: intl.formatList(
                            following.map((widget) => widget.label ?? widget.id),
                            { type: 'conjunction' },
                        ),
                    })}
                </p>
            ) : null}
        </div>
    );
}
