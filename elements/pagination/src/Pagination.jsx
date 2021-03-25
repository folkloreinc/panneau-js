/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defineMessages } from 'react-intl';

import Link from '@panneau/element-link';
import Label from '@panneau/element-label';

const messages = defineMessages({
    previous: {
        id: 'pagination.previous',
        defaultMessage: 'Previous',
    },
    next: {
        id: 'pagination.next',
        defaultMessage: 'Next',
    },
    itemsCount: {
        id: 'pagination.items_count',
        defaultMessage: '{count, plural, =0 {No item.} =1 {# item} other {# items}}',
    },
});

const propTypes = {
    page: PropTypes.number,
    lastPage: PropTypes.number,
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
    lastPage: 1,
    total: null,
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
    lastPage,
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
    const pages = [...Array(lastPage).keys()].map((it) => it + 1);
    return (
        <nav
            className={classNames([
                'd-flex',
                'align-items-center',
                'm-0',
                {
                    [className]: className !== null,
                },
            ])}
        >
            <ul
                className={classNames([
                    'pagination',
                    'm-0',
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
                                disabled: page >= lastPage,
                                [itemClassName]: itemClassName !== null,
                            },
                        ])}
                    >
                        {page < lastPage ? (
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
                                {messages.next}
                            </span>
                        )}
                    </li>
                ) : null}
            </ul>
            {total !== null ? (
                <div className="ml-4 text-muted">
                    <Label values={{ count: total }}>{messages.itemsCount}</Label>
                </div>
            ) : null}
        </nav>
    );
};

PaginationMenu.propTypes = propTypes;
PaginationMenu.defaultProps = defaultProps;

export default PaginationMenu;
