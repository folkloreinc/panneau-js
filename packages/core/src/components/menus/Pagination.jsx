/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defineMessages } from 'react-intl';

// import { PropTypes as MicromagPropTypes } from '../../lib';
import Link from '../partials/Link';
import Label from '../partials/Label';

import styles from '../../styles/menus/pagination.module.scss';

const messages = defineMessages({
    previous: {
        id: 'menus.pagination.previous',
        defaultMessage: 'Previous',
    },
    next: {
        id: 'menus.pagination.next',
        defaultMessage: 'next',
    },
});

const propTypes = {
    page: PropTypes.number,
    total: PropTypes.number,
    url: PropTypes.string,
    withPreviousNext: PropTypes.bool,
    className: PropTypes.string,
    paginationClassName: PropTypes.string,
    itemClassName: PropTypes.string,
    linkClassName: PropTypes.string,
    onClickPage: PropTypes.func,
};

const defaultProps = {
    page: 1,
    total: 1,
    url: null,
    withPreviousNext: false,
    className: null,
    paginationClassName: null,
    itemClassName: null,
    linkClassName: null,
    onClickPage: null,
};

const PaginationMenu = ({
    page,
    total,
    url,
    withPreviousNext,
    className,
    paginationClassName,
    itemClassName,
    linkClassName,
    onClickPage,
}) => {
    const getUrl = useCallback(
        (currentPage) =>
            url !== null
                ? `${url}${
                      url.indexOf('?') !== -1 ? `&page=${currentPage}` : `?page=${currentPage}`
                  }`
                : null,
        [url],
    );
    const pages = [...Array(total).keys()].map((it) => it + 1);
    return (
        <nav
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <ul
                className={classNames([
                    'pagination',
                    {
                        [paginationClassName]: paginationClassName !== null,
                    },
                ])}
            >
                {withPreviousNext ? (
                    <li
                        className={classNames([
                            'page-item',
                            {
                                disabled: page <= 1,
                                [itemClassName]: itemClassName !== null,
                            },
                        ])}
                    >
                        {page > 1 ? (
                            <Link
                                className={classNames([
                                    'page-link',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
                                ])}
                                href={getUrl(page - 1)}
                                onClick={onClickPage !== null ? () => onClickPage(page - 1) : null}
                            >
                                {messages.previous}
                            </Link>
                        ) : (
                            <span
                                className={classNames([
                                    'page-link',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
                                ])}
                            >
                                <Label>{messages.previous}</Label>
                            </span>
                        )}
                    </li>
                ) : null}

                {pages.map((pageNumber) => (
                    <li
                        key={`page-${pageNumber}`}
                        className={classNames([
                            'page-item',
                            {
                                active: pageNumber === page,
                                [itemClassName]: itemClassName !== null,
                            },
                        ])}
                    >
                        <Link
                            className={classNames([
                                'page-link',
                                {
                                    [linkClassName]: linkClassName !== null,
                                },
                            ])}
                            href={getUrl(pageNumber)}
                            onClick={onClickPage !== null ? () => onClickPage(pageNumber) : null}
                        >
                            {pageNumber}
                        </Link>
                    </li>
                ))}

                {withPreviousNext ? (
                    <li
                        className={classNames([
                            'page-item',
                            {
                                disabled: page >= total,
                                [itemClassName]: itemClassName !== null,
                            },
                        ])}
                    >
                        {page < total ? (
                            <Link
                                className={classNames([
                                    'page-link',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
                                ])}
                                href={getUrl(page + 1)}
                                onClick={onClickPage !== null ? () => onClickPage(page + 1) : null}
                            >
                                {messages.next}
                            </Link>
                        ) : (
                            <span
                                className={classNames([
                                    'page-link',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
                                ])}
                            >
                                <Label>{messages.next}</Label>
                            </span>
                        )}
                    </li>
                ) : null}
            </ul>
        </nav>
    );
};

PaginationMenu.propTypes = propTypes;
PaginationMenu.defaultProps = defaultProps;

export default PaginationMenu;
