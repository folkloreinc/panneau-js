import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
    total: PropTypes.number,
    perPage: PropTypes.number,
    currentPage: PropTypes.number,
    lastPage: PropTypes.number,
    url: PropTypes.string,
    pageParamName: PropTypes.string,
    interval: PropTypes.number,
    showArrows: PropTypes.bool,
    onClickPage: PropTypes.func,
    onClickPrevious: PropTypes.func,
    onClickNext: PropTypes.func,
};

const defaultProps = {
    total: 0,
    perPage: 0,
    currentPage: 0,
    lastPage: 0,
    url: '',
    pageParamName: 'page',
    interval: null,
    showArrows: true,
    onClickPage: null,
    onClickPrevious: null,
    onClickNext: null,
};

const PreviousLink = ({
    currentPage,
    lastPage,
    url,
    onClick,
}) => {
    const isFirstPage = currentPage === 1;
    const previousPage = isFirstPage ? lastPage : currentPage - 1;
    const onClickPrevious = !isFirstPage ? e => onClick(e, previousPage) : null;

    const itemClassNames = classNames({
        disabled: isFirstPage,
    });

    return (
        <li
            className={itemClassNames}
        >
            <a
                href={isFirstPage ? '#' : url}
                onClick={onClickPrevious}
                aria-label="Previous"
            >
                <span
                    aria-hidden="true"
                >
                    &laquo;
                </span>
            </a>
        </li>
    );
};

const NextLink = ({
    currentPage,
    lastPage,
    url,
    onClick,
}) => {
    const isLastPage = currentPage === lastPage;
    const nextPage = isLastPage ? 1 : currentPage + 1;
    const onClickNext = !isLastPage ? e => onClick(e, nextPage) : null;

    const itemClassNames = classNames({
        disabled: isLastPage,
    });

    return (
        <li
            className={itemClassNames}
        >
            <a
                href={url}
                onClick={onClickNext}
                aria-label="Next"
            >
                <span
                    aria-hidden
                >
                    &raquo;
                </span>
            </a>
        </li>
    );
};

const PageLinks = ({
    interval,
    currentPage,
    lastPage,
    onClick,
}) => {
    const links = [];
    console.log(interval, lastPage);
    if (interval && lastPage > interval) {
        const middle = Math.floor(interval / 2);
        let visibleStart = Math.max(1, currentPage - middle);
        const visibleEnd = Math.min(lastPage, (visibleStart + interval) - 1);
        if (visibleEnd - visibleStart < interval && visibleStart !== 1) {
            visibleStart = Math.max(1, (visibleEnd - interval) + 1);
        }

        if (visibleStart > 1) {
            links.push((
                <PageLink
                    key="page_1"
                    page={1}
                    currentPage={currentPage}
                    onClick={onClick}
                />
            ));
        }

        if (visibleStart - 1 > 1) {
            links.push((
                <PageDots
                    key="dots_1"
                    page={1}
                />
            ));
        }

        for (let i = visibleStart; i <= visibleEnd; i += 1) {
            links.push((
                <PageLink
                    key={`page_${i}`}
                    page={i}
                    currentPage={currentPage}
                    onClick={onClick}
                />
            ));
        }

        if (visibleEnd + 1 < lastPage) {
            links.push((
                <PageDots
                    key={`dots_${lastPage}`}
                    page={lastPage}
                />
            ));
        }

        if (visibleEnd < lastPage) {
            links.push((
                <PageLink
                    key={`page_${lastPage}`}
                    page={lastPage}
                    currentPage={currentPage}
                    onClick={onClick}
                />
            ));
        }
    } else {
        for (let ii = 1; ii <= lastPage; ii += 1) {
            links.push((
                <PageLink
                    key={`page_${ii}`}
                    page={ii}
                    currentPage={currentPage}
                    onClick={onClick}
                />
            ));
        }
    }

    return links;
};

const PageLink = ({ page, currentPage, onClick }) => {
    // const url = this.url(page);
    const url = 'lolmagie';
    const onClickPage = e => onClick(e, page);

    const itemClassNames = classNames({
        active: currentPage === page,
    });

    return (
        <li
            className={itemClassNames}
        >
            <a
                href={url}
                onClick={onClickPage}
            >
                { page }
            </a>
        </li>
    );
};

const PageDots = (page) => {
    const key = `dots_${page}`;
    const itemClassNames = classNames({
        disabled: true,
    });

    return (
        <li
            key={key}
            className={itemClassNames}
        >
            <a
                href="#"
            >
                ...
            </a>
        </li>
    );
};

const Pagination = ({
    total,
    perPage,
    currentPage,
    lastPage,
    url,
    pageParamName,
    interval,
    showArrows,
    onClickPage,
    onClickPrevious,
    onClickNext,
}) => {
    const previousLinkUrl = '';
    const nextLinkUrl = '';
    // this.props.url.replace(/(page\=)[^\&]+/, '$1'+page);

    const listClassNames = classNames({
        pagination: true,
    });

    return (
        <nav>
            <ul
                className={listClassNames}
            >
                <PreviousLink
                    currentPage={currentPage}
                    lastPage={lastPage}
                    url={previousLinkUrl}
                    onClick={onClickPrevious}
                />
                { showArrows && (
                    <PageLinks
                        interval={interval}
                        currentPage={currentPage}
                        lastPage={lastPage}
                        onClick={onClickPage}
                    />
                )}
                { showArrows && (
                    <NextLink
                        currentPage={currentPage}
                        lastPage={lastPage}
                        url={nextLinkUrl}
                        onClick={onClickNext}
                    />
                )}
            </ul>
        </nav>
    );
};

Pagination.propTypes = propTypes;
Pagination.defaultProps = defaultProps;

export default Pagination;
