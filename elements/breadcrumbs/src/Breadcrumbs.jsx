/* eslint-disable react/no-array-index-key, jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Link from '@panneau/element-link';
import Label from '@panneau/element-label';
import Button from '@panneau/element-button';

import styles from './styles.module.scss';

const propTypes = {
    items: PanneauPropTypes.breadcrumbItems,
    theme: PanneauPropTypes.bootstrapThemes,
    separator: PropTypes.oneOf([null, 'arrow']),
    withoutBar: PropTypes.bool,
    noWrap: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    items: [],
    theme: null,
    separator: null,
    withoutBar: false,
    noWrap: false,
    className: null,
};

const Breadcrumbs = ({ items, theme, separator, withoutBar, noWrap, className }) => (
    <nav className={className}>
        <ol
            className={classNames([
                styles.container,
                'breadcrumb',
                'mb-0',
                {
                    'p-0': withoutBar,
                    'bg-transparent': withoutBar,
                    'rounded-0': withoutBar,
                    'flex-nowrap': noWrap,
                },
            ])}
        >
            {items.map(({ url, label, active = false, onClick = null }, index) => (
                <li
                    className={classNames([
                        'breadcrumb-item',
                        {
                            active,
                            [styles.arrow]: separator === 'arrow',
                            [`text-${theme}`]: active && theme !== null,
                        },
                    ])}
                    key={`item-${index}`}
                >
                    {active ? <Label>{label}</Label> : null}
                    {!active && url ? (
                        <Link
                            to={url}
                            onClick={onClick}
                            className={classNames({
                                [`text-${theme}`]: theme !== null,
                            })}
                        >
                            <Label>{label}</Label>
                        </Link>
                    ) : null}
                    {!active && onClick ? (
                        <Button
                            onClick={onClick}
                            className={classNames({
                                [`text-${theme}`]: theme !== null,
                            })}
                        >
                            <Label>{label}</Label>
                        </Button>
                    ) : null}
                </li>
            ))}
        </ol>
    </nav>
);

Breadcrumbs.propTypes = propTypes;
Breadcrumbs.defaultProps = defaultProps;

export default Breadcrumbs;
