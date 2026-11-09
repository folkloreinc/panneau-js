import { ListChecks, LoaderCircle } from 'lucide-react';
import { Button } from 'react-aria-components';

import { ActionRuns, useActionRuns } from '@panneau/actions';
import { appMessages } from '@panneau/intl';
import {
    Heading,
    Icon,
    Popover,
    type PopoverProps,
    PopoverTrigger,
    Tooltip,
    usePanneauIntl,
} from '@panneau/ui';

import { cx } from '../cx';
import styles from './ActionRunsButton.module.css';

export interface ActionRunsButtonProps {
    /**
     * `row`: a row of the sidebar, with its label. `icon`: an icon with its badge, for the rail of
     * icons and the top bar, with the label in a tooltip. `tile`: an icon with its badge and the
     * label under it, for the dock.
     */
    appearance?: 'row' | 'icon' | 'tile';
    /** Where the popover opens. Defaults to the end of the button, as for a sidebar. */
    placement?: PopoverProps['placement'];
    className?: string;
}

/**
 * The notification area of the shell: a button shown while the action runner follows queued runs,
 * with a badge that counts those in progress. It opens a popover with their status and progress
 * (`ActionRuns`), so that runs stay in sight from any page. It goes away once every run is
 * dismissed.
 */
export function ActionRunsButton({
    appearance = 'row',
    placement = 'end bottom',
    className,
}: ActionRunsButtonProps) {
    const intl = usePanneauIntl();
    const { runs } = useActionRuns();
    if (runs.length === 0) {
        return null;
    }
    const active = runs.filter(
        ({ run }) => run.status === 'queued' || run.status === 'running',
    ).length;
    const title = intl.formatMessage(appMessages.actionRuns);
    const label = intl.formatMessage(appMessages.actionRunsLabel, { count: active });
    const icon = (
        <span className={styles.icon}>
            <Icon
                icon={active > 0 ? LoaderCircle : ListChecks}
                size="md"
                className={cx(active > 0 && styles.spinning)}
            />
            {appearance !== 'row' && active > 0 ? (
                <span className={styles.dot} aria-hidden="true">
                    {active}
                </span>
            ) : null}
        </span>
    );
    const button = (
        <Button
            aria-label={label}
            className={cx(
                appearance === 'row'
                    ? styles.row
                    : appearance === 'tile'
                      ? styles.tile
                      : styles.iconButton,
                className,
            )}
        >
            {icon}
            {appearance === 'tile' ? <span className={styles.tileLabel}>{title}</span> : null}
            {appearance === 'row' ? (
                <>
                    <span className={styles.label}>{title}</span>
                    {active > 0 ? (
                        <span className={styles.count} aria-hidden="true">
                            {active}
                        </span>
                    ) : null}
                </>
            ) : null}
        </Button>
    );
    return (
        <PopoverTrigger>
            {appearance === 'icon' ? (
                <Tooltip
                    content={label}
                    placement={
                        placement.startsWith('bottom')
                            ? 'bottom'
                            : placement.startsWith('top')
                              ? 'top'
                              : 'end'
                    }
                    delay={300}
                >
                    {button}
                </Tooltip>
            ) : (
                button
            )}
            <Popover placement={placement} aria-label={title} className={styles.popover}>
                <Heading level={2} size={4} className={styles.heading}>
                    {title}
                </Heading>
                <ActionRuns />
            </Popover>
        </PopoverTrigger>
    );
}
