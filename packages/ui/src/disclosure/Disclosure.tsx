import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Disclosure as AriaDisclosure,
    Button,
    DisclosurePanel,
    Heading,
} from 'react-aria-components';

import { Icon } from '../icon/Icon';
import { cx } from '../utils/cx';
import styles from './Disclosure.module.css';

export interface DisclosureProps {
    /** Title of the button that expands and collapses the content. */
    title: ReactNode;
    /** Content after the title, in the button: a count of errors. */
    titleEnd?: ReactNode;
    /** Heading level of the title. Defaults to 3. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    children?: ReactNode;
    isExpanded?: boolean;
    defaultExpanded?: boolean;
    onExpandedChange?: (isExpanded: boolean) => void;
    id?: string;
    className?: string;
    triggerClassName?: string;
    panelClassName?: string;
}

/** A section whose content can be collapsed under its title. */
export function Disclosure({
    title,
    titleEnd,
    headingLevel = 3,
    children,
    className,
    triggerClassName,
    panelClassName,
    ...props
}: DisclosureProps) {
    return (
        <AriaDisclosure
            data-panneau="disclosure"
            {...props}
            className={cx(styles.disclosure, className)}
        >
            <Heading level={headingLevel} className={styles.heading}>
                <Button slot="trigger" className={cx(styles.trigger, triggerClassName)}>
                    <Icon icon={ChevronRight} className={styles.chevron} />
                    <span className={styles.title}>{title}</span>
                    {titleEnd !== undefined ? <> {titleEnd}</> : null}
                </Button>
            </Heading>
            <DisclosurePanel className={cx(styles.panel, panelClassName)}>
                <div className={styles.panelContent}>{children}</div>
            </DisclosurePanel>
        </AriaDisclosure>
    );
}
