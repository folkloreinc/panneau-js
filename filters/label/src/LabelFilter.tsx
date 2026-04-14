import classNames from 'classnames';
import { type ReactNode } from 'react';

import Link from '@panneau/element-link';

import styles from './styles.module.css';

interface LabelFilterProps {
    onClick?: (() => void) | null;
    onClear?: (() => void) | null;
    label?: ReactNode | null;
    sublabel?: ReactNode | null;
    href?: string | null;
    disabled?: boolean;
    className?: string | null;
}

function LabelFilter({
    onClick = null,
    onClear = null,
    label = null,
    sublabel = null,
    href = null,
    disabled = false,
    className = null,
    ...props
}: LabelFilterProps) {
    const inner = (
        <>
            {label !== null ? <span className={styles.label}>{label}</span> : null}
            {sublabel !== null ? <span className={styles.sublabel}>{sublabel}</span> : null}
        </>
    );
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.disabled]: disabled,
                    [className!]: className !== null,
                },
            ])}
        >
            {href === null && onClick !== null ? (
                <button
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    className={styles.button}
                    {...props}
                >
                    {inner}
                </button>
            ) : null}
            {href !== null ? (
                <Link className={styles.link} href={href} onClick={onClick} {...props}>
                    {inner}
                </Link>
            ) : null}
            {href === null && onClick === null ? inner : null}
        </div>
    );
}

export default LabelFilter;
