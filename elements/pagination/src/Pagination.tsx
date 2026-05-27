/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import queryString from 'query-string';
import { MouseEvent, ReactNode, cloneElement, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Item } from '@panneau/core';
import Icon from '@panneau/element-icon';
import Link from '@panneau/element-link';

interface PaginationProps {
    page?: number;
    lastPage?: number;
    total?: number | null;
    url?: string | null;
    query?: Record<string, any> | null;
    maxPages?: number;
    loading?: boolean;
    withPreviousNext?: boolean;
    withCount?: boolean;
    autohide?: boolean;
    align?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg' | null;
    previousLabel?: ReactNode | null;
    nextLabel?: ReactNode | null;
    countLabel?: ReactNode | null;
    alwaysShowButtons?: boolean;
    selectable?: boolean;
    selectedItems?: Item[] | null;
    onSelectionChange?: ((items: Item[] | null) => void) | null;
    multipleSelection?: boolean;
    className?: string | null;
    paginationClassName?: string | null;
    itemClassName?: string | null;
    linkClassName?: string | null;
    onClickPage?: ((e: MouseEvent, page: number) => void) | null;
}

function Pagination({
    page: parentPage = 1,
    lastPage: parentLastPage = 1,
    total: parentTotal = null,
    url = null,
    query = null,
    maxPages: parentMaxPages = 8,
    loading = false,
    withPreviousNext = false,
    withCount = true,
    autohide = false,
    align = 'right',
    size = null,
    previousLabel: initialPreviousLabel = null,
    nextLabel: initialNextLabel = null,
    countLabel: initialCountLabel = null,
    alwaysShowButtons = false,
    selectable = false,
    selectedItems = null,
    onSelectionChange = null,
    multipleSelection = false,
    className = null,
    paginationClassName = null,
    itemClassName = null,
    linkClassName = null,
    onClickPage = null,
}: PaginationProps) {
    const page = parseInt(String(parentPage), 10);
    const lastPage = parseInt(String(parentLastPage), 10);
    const total = parentTotal !== null ? parseInt(String(parentTotal), 10) : null;
    const maxPages = parseInt(String(parentMaxPages), 10);

    const previousLabel = initialPreviousLabel || <Icon name="arrow-left-short" />;
    const nextLabel = initialNextLabel || <Icon name="arrow-right-short" />;
    const countLabel = initialCountLabel || (
        <FormattedMessage
            defaultMessage="{count, plural, =0 {No item.} =1 {# item} other {# items}}"
            description="Pagination count label"
        />
    );

    const finalOnClickPage = useCallback(
        (e, value) => {
            if (onClickPage !== null) {
                onClickPage(e, value);
            }
        },
        [onClickPage],
    );

    const getUrl = useCallback(
        (currentPage: number) =>
            url !== null
                ? `${url}?${queryString.stringify(
                      { ...query, page: currentPage },
                      {
                          arrayFormat: 'bracket',
                      },
                  )}`
                : null,
        [url, query],
    );

    const pageNumbers = Array.from({ length: parseInt(String(lastPage), 10) }, (_, i) => i + 1);
    const stripPages = maxPages !== null && lastPage > maxPages;
    const startPage = stripPages
        ? Math.min(Math.max(page - maxPages / 2, 1), lastPage - maxPages)
        : 1;
    const endPage = stripPages ? startPage + maxPages : lastPage;
    const strippedPages = stripPages
        ? pageNumbers.reduce((selectedPages: (number | string)[], pageNumber: number) => {
              if (pageNumber === 1 && startPage - 1 > 1) {
                  return [pageNumber, '...'];
              }
              if (pageNumber === lastPage && endPage + 1 < lastPage) {
                  return [...selectedPages, '...', pageNumber];
              }
              return pageNumber >= startPage && pageNumber <= endPage
                  ? [...selectedPages, pageNumber]
                  : selectedPages;
          }, [])
        : pageNumbers;

    const pages = strippedPages.length > 0 ? strippedPages : [1];

    const element = cloneElement(countLabel as ReactElement, {
        values: { count: total },
    });

    const selectedCount = selectedItems?.length ?? 0;

    const onClearSelection = useCallback(() => {
        if (onSelectionChange) {
            onSelectionChange(null);
        }
    }, [onSelectionChange]);

    if (autohide && lastPage < 2) {
        return null;
    }

    const count = (
        <div className="d-flex align-items-center justify-content-center">
            {selectable && selectedCount > 0 ? (
                <small className="text-small text-nowrap text-muted fw-normal">
                    <span className="d-inline-block">
                        <FormattedMessage
                            defaultMessage="{count, plural, =0 {no items} one {# item} other {# items}} selected"
                            description="Checkbox label"
                            values={{ count: selectedCount }}
                        />
                    </span>
                </small>
            ) : null}
            {selectable && onSelectionChange !== null && selectedCount > 0 ? (
                <button
                    type="button"
                    className="btn badge rounded-pill text-bg-secondary mx-2"
                    onClick={onClearSelection}
                >
                    <FormattedMessage defaultMessage="clear" description="Button label" />
                    <Icon className="ps-1" name="x" bold />
                </button>
            ) : null}
            <span className="text-muted text-nowrap">{element}</span>
        </div>
    );

    return (
        <nav
            className={classNames([
                'd-flex',
                'align-items-center',
                'm-0',
                {
                    'justify-content-end': align === 'right',
                },
                className,
            ])}
        >
            {loading && align === 'right' ? (
                <div className="spinner-border text-secondary spinner-border-sm mx-1" role="status">
                    <span className="visually-hidden">
                        <FormattedMessage defaultMessage="Loading..." description="Hidden label" />
                    </span>
                </div>
            ) : null}
            {total !== null && total > 0 && withCount && align === 'right' ? (
                <div className="mx-3">{count}</div>
            ) : null}
            <ul
                className={classNames([
                    'pagination',
                    'm-0',
                    {
                        'pagination-sm': size === 'sm',
                        'pagination-lg': size === 'lg',
                    },
                    paginationClassName,
                ])}
            >
                {withPreviousNext && (pages.length > 1 || alwaysShowButtons) ? (
                    <li
                        className={classNames([
                            'page-item',
                            {
                                disabled: page <= 1,
                            },
                            itemClassName,
                        ])}
                    >
                        {page > 1 ? (
                            <Link
                                className={classNames([
                                    'page-link',
                                    'rounded-0',
                                    'rounded-start',
                                    linkClassName,
                                ])}
                                href={getUrl(page - 1) || '#'}
                                onClick={(e) => finalOnClickPage(e, page - 1)}
                            >
                                {previousLabel}
                            </Link>
                        ) : (
                            <span
                                className={classNames([
                                    'page-link',
                                    'rounded-0',
                                    'rounded-start',
                                    linkClassName,
                                ])}
                            >
                                {previousLabel}
                            </span>
                        )}
                    </li>
                ) : null}

                {pages.length > 1
                    ? pages.map((pageNumber, index) => (
                          <li
                              key={`page-${pageNumber}-${index}`}
                              className={classNames([
                                  'page-item',
                                  {
                                      disabled: pageNumber === '...' || pages.length < 2,
                                      active: pageNumber === page && pages.length > 1,
                                  },
                                  itemClassName,
                              ])}
                          >
                              <Link
                                  className={classNames(['page-link', 'rounded-0', linkClassName])}
                                  href={
                                      pageNumber !== '...'
                                          ? getUrl(pageNumber as number) || '#'
                                          : '#'
                                  }
                                  onClick={
                                      pageNumber !== '...'
                                          ? (e) => finalOnClickPage(e, pageNumber as number)
                                          : undefined
                                  }
                                  style={{ zIndex: 0 }}
                              >
                                  {pageNumber}
                              </Link>
                          </li>
                      ))
                    : null}

                {withPreviousNext && (pages.length > 1 || alwaysShowButtons) ? (
                    <li
                        className={classNames([
                            'page-item',
                            {
                                disabled: page >= lastPage,
                            },
                            itemClassName,
                        ])}
                    >
                        {page < lastPage ? (
                            <Link
                                className={classNames([
                                    'page-link',
                                    'rounded-0',
                                    'rounded-end',
                                    linkClassName,
                                ])}
                                href={getUrl(page + 1) || '#'}
                                onClick={(e) => finalOnClickPage(e, page + 1)}
                            >
                                {nextLabel}
                            </Link>
                        ) : (
                            <span
                                className={classNames([
                                    'page-link',
                                    'rounded-0',
                                    'rounded-end',
                                    linkClassName,
                                ])}
                            >
                                {nextLabel}
                            </span>
                        )}
                    </li>
                ) : null}
            </ul>

            {total !== null && total > 0 && withCount && align === 'left' ? (
                <div className="mx-3">{count}</div>
            ) : null}

            {loading && align === 'left' ? (
                <div className="spinner-border text-secondary spinner-border-sm mx-1" role="status">
                    <span className="visually-hidden">
                        <FormattedMessage defaultMessage="Loading..." description="Hidden label" />
                    </span>
                </div>
            ) : null}
        </nav>
    );
}

export default Pagination;
