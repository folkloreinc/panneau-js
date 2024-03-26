/* eslint-disable jsx-a11y/control-has-associated-label */

/* eslint-disable react/jsx-indent */

/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@panneau/element-icon';
import Link from '@panneau/element-link';

const propTypes = {
    page: PropTypes.number,
    lastPage: PropTypes.number,
    total: PropTypes.number,
    url: PropTypes.string,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    maxPages: PropTypes.number,
    loading: PropTypes.bool,
    withPreviousNext: PropTypes.bool,
    withCount: PropTypes.bool,
    autohide: PropTypes.bool,
    align: PropTypes.oneOf(['left', 'right']),
    previousLabel: PropTypes.node,
    nextLabel: PropTypes.node,
    countLabel: PropTypes.node,
    alwaysShowButtons: PropTypes.bool,
    onSelectPage: PropTypes.func,
    selectedCount: PropTypes.number,
    onClearSelected: PropTypes.func,
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
    query: null,
    maxPages: 8,
    loading: false,
    withPreviousNext: false,
    withCount: true,
    autohide: false,
    align: 'right',
    previousLabel: <Icon name="arrow-left-short" />,
    nextLabel: <Icon name="arrow-right-short" />,
    countLabel: (
        <FormattedMessage
            defaultMessage="{count, plural, =0 {No item.} =1 {# item} other {# items}}"
            description="Pagination count label"
        />
    ),
    alwaysShowButtons: false,
    selectedCount: null,
    onSelectPage: null,
    onClearSelected: null,
    className: null,
    paginationClassName: null,
    itemClassName: null,
    linkClassName: null,
    onClickPage: null,
};

const Pagination = ({
    page: parentPage,
    lastPage: parentLastPage,
    total: parentTotal,
    url,
    query,
    maxPages: parentMaxPages,
    loading,
    withPreviousNext,
    withCount,
    autohide,
    align,
    previousLabel,
    nextLabel,
    countLabel,
    alwaysShowButtons,
    selectedCount,
    onSelectPage,
    onClearSelected,
    className,
    paginationClassName,
    itemClassName,
    linkClassName,
    onClickPage,
}) => {
    const page = parseInt(parentPage, 10);
    const lastPage = parseInt(parentLastPage, 10);
    const total = parseInt(parentTotal, 10);
    const maxPages = parseInt(parentMaxPages, 10);

    const getUrl = useCallback(
        (currentPage) =>
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

    const pageNumbers = Array.from({ length: parseInt(lastPage, 10) }, (_, i) => i + 1);
    const stripPages = maxPages !== null && lastPage > maxPages;
    const startPage = stripPages
        ? Math.min(Math.max(page - maxPages / 2, 1), lastPage - maxPages)
        : null;
    const endPage = stripPages ? startPage + maxPages : null;
    const strippedPages = stripPages
        ? pageNumbers.reduce((selectedPages, pageNumber) => {
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

    const element = React.cloneElement(countLabel, {
        values: { count: total },
    });

    if (autohide && lastPage < 2) {
        return null;
    }

    const count = (
        <>
            {selectedCount > 0 ? (
                <small className="text-small mx-2 text-nowrap text-muted fw-normal">
                    <span className="d-inline-block mb-1">
                        <FormattedMessage
                            defaultMessage="{count, plural, =0 {no items} one {# item} other {# items}} selected"
                            description="Checkbox label"
                            values={{ count: selectedCount }}
                        />
                    </span>
                </small>
            ) : null}
            {onSelectPage !== null ? (
                <button
                    type="button"
                    className="btn badge rounded-pill text-bg-light mx-1"
                    onClick={onSelectPage}
                >
                    <FormattedMessage defaultMessage="select all" description="Button label" />
                    <Icon className="ps-1" name="x" bold />
                </button>
            ) : null}
            {onClearSelected !== null && selectedCount > 0 ? (
                <button
                    type="button"
                    className="btn badge rounded-pill text-bg-primary mx-2"
                    onClick={onClearSelected}
                >
                    <FormattedMessage defaultMessage="clear" description="Button label" />
                    <Icon className="ps-1" name="x" bold />
                </button>
            ) : null}
            <span className="text-muted">{element}</span>
        </>
    );

    return (
        <nav
            className={classNames([
                'd-flex',
                'align-items-center',
                'm-0',
                {
                    'justify-content-end': align === 'right',
                    [className]: className !== null,
                },
            ])}
        >
            {align === 'right' ? (
                <div className="mx-3 text-muted">
                    {loading ? (
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">
                                <FormattedMessage
                                    defaultMessage="Loading..."
                                    description="Hidden label"
                                />
                            </span>
                        </div>
                    ) : null}
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
                        [paginationClassName]: paginationClassName !== null,
                    },
                ])}
            >
                {withPreviousNext && (pages.length > 1 || alwaysShowButtons) ? (
                    <li
                        className={classNames([
                            'page-item',
                            // 'rounded',
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
                                    'rounded-0',
                                    'rounded-start',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
                                ])}
                                href={getUrl(page - 1)}
                                onClick={
                                    onClickPage !== null ? (e) => onClickPage(page - 1, e) : null
                                }
                            >
                                {previousLabel}
                            </Link>
                        ) : (
                            <span
                                className={classNames([
                                    'page-link',
                                    'rounded-0',
                                    'rounded-start',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
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
                                      [itemClassName]: itemClassName !== null,
                                  },
                              ])}
                          >
                              <Link
                                  className={classNames([
                                      'page-link',
                                      'rounded-0',
                                      {
                                          [linkClassName]: linkClassName !== null,
                                      },
                                  ])}
                                  href={pageNumber !== '...' ? getUrl(pageNumber) : '#'}
                                  onClick={
                                      pageNumber !== '...' && onClickPage !== null
                                          ? (e) => onClickPage(pageNumber, e)
                                          : null
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
                                [itemClassName]: itemClassName !== null,
                            },
                        ])}
                    >
                        {page < lastPage ? (
                            <Link
                                className={classNames([
                                    'page-link',
                                    'rounded-0',
                                    'rounded-end',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
                                ])}
                                href={getUrl(page + 1)}
                                onClick={
                                    onClickPage !== null ? (e) => onClickPage(page + 1, e) : null
                                }
                            >
                                {nextLabel}
                            </Link>
                        ) : (
                            <span
                                className={classNames([
                                    'page-link',
                                    'rounded-0',
                                    'rounded-end',
                                    {
                                        [linkClassName]: linkClassName !== null,
                                    },
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

            {align === 'left' ? (
                <div className="mx-3 text-muted">
                    {loading ? (
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">
                                <FormattedMessage
                                    defaultMessage="Loading..."
                                    description="Hidden label"
                                />
                            </span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </nav>
    );
};

Pagination.propTypes = propTypes;
Pagination.defaultProps = defaultProps;

export default Pagination;
