/* eslint-disable jsx-a11y/control-has-associated-label, react/jsx-indent, react/no-array-index-key, react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback, useMemo } from 'react';
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
    selectable: PropTypes.bool,
    selectedItems: PropTypes.arrayOf(PropTypes.shape({})),
    onSelectionChange: PropTypes.func,
    multipleSelection: PropTypes.bool,
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
    selectable: false,
    selectedItems: null,
    onSelectionChange: null,
    multipleSelection: false,
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
    selectable,
    selectedItems,
    onSelectionChange,
    multipleSelection,
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

    const selectedCount = useMemo(
        () => (selectedItems !== null && selectedItems.length > 0 ? selectedItems.length : null),
        [selectedItems],
    );

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
                    onClick={
                        multipleSelection ? () => onSelectionChange([]) : onSelectionChange(null)
                    }
                >
                    <FormattedMessage defaultMessage="clear" description="Button label" />
                    <Icon className="ps-1" name="x" bold />
                </button>
            ) : null}
            <span className="text-muted">{element}</span>
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
                    [className]: className !== null,
                },
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

            {loading && align === 'left' ? (
                <div className="spinner-border text-secondary spinner-border-sm mx-1" role="status">
                    <span className="visually-hidden">
                        <FormattedMessage defaultMessage="Loading..." description="Hidden label" />
                    </span>
                </div>
            ) : null}
        </nav>
    );
};

Pagination.propTypes = propTypes;
Pagination.defaultProps = defaultProps;

export default Pagination;
