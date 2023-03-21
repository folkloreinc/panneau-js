/* eslint-disable react/jsx-indent */

/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Link from '@panneau/element-link';

const propTypes = {
    page: PropTypes.number,
    lastPage: PropTypes.number,
    total: PropTypes.number,
    url: PropTypes.string,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    maxPages: PropTypes.number,
    withPreviousNext: PropTypes.bool,
    withCount: PropTypes.bool,
    autohide: PropTypes.bool,
    align: PropTypes.oneOf(['left', 'right']),
    previousLabel: PropTypes.node,
    nextLabel: PropTypes.node,
    countLabel: PropTypes.node,
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
    withPreviousNext: false,
    withCount: true,
    autohide: false,
    align: 'right',
    previousLabel: (
        <FormattedMessage defaultMessage="Previous" description="Pagination button label" />
    ),
    nextLabel: <FormattedMessage defaultMessage="Next" description="Pagination button label" />,
    countLabel: (
        <FormattedMessage
            defaultMessage="{count, plural, =0 {No item.} =1 {# item} other {# items}}"
            description="Pagination count label"
        />
    ),
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
    withPreviousNext,
    withCount,
    autohide,
    align,
    previousLabel,
    nextLabel,
    countLabel,
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

    if (autohide && lastPage < 2) {
        return null;
    }

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
            {total !== null && total > 0 && withCount && align === 'right' ? (
                <div className="mx-3 text-muted">
                    {React.cloneElement(countLabel, {
                        values: { count: total },
                    })}
                </div>
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
                                {previousLabel}
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
                                      {
                                          [linkClassName]: linkClassName !== null,
                                      },
                                  ])}
                                  href={pageNumber !== '...' ? getUrl(pageNumber) : '#'}
                                  onClick={
                                      pageNumber !== '...' && onClickPage !== null
                                          ? () => onClickPage(pageNumber)
                                          : null
                                  }
                              >
                                  {pageNumber}
                              </Link>
                          </li>
                      ))
                    : null}

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
                                {nextLabel}
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
                                {nextLabel}
                            </span>
                        )}
                    </li>
                ) : null}
            </ul>
            {total !== null && total > 0 && withCount && align === 'left' ? (
                <div className="mx-3 text-muted">
                    {React.cloneElement(countLabel, {
                        values: { count: total },
                    })}
                </div>
            ) : null}
        </nav>
    );
};

Pagination.propTypes = propTypes;
Pagination.defaultProps = defaultProps;

export default Pagination;
