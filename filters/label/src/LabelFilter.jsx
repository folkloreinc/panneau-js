/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Link from '@panneau/element-link';

import styles from './styles.module.scss';

const propTypes = {
    label: PropTypes.string,
    sublabel: PropTypes.string,
    href: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    label: null,
    sublabel: null,
    href: null,
    disabled: false,
    onClick: null,
    className: null,
};

const LabelFilter = ({ label, sublabel, href, disabled, onClick, className, ...props }) => {
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
                    [className]: className !== null,
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
};

LabelFilter.propTypes = propTypes;
LabelFilter.defaultProps = defaultProps;

export default LabelFilter;
