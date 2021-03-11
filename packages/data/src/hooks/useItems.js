import { useEffect, useState, useMemo, useRef } from 'react';

const useItems = ({
    getPage = null,
    getItems = null,
    page = null,
    count = 10,
    items: providedItems = null,
    pages: initialPages = null,
    getPageFromResponse = ({
        meta: { current_page: currentPage, last_page: lastPage, total },
        data: items,
    }) => ({
        page: parseInt(currentPage, 10),
        lastPage: parseInt(lastPage, 10),
        total: parseInt(total, 10),
        items,
    }),
    getItemsFromResponse = (data) => data,
    onItemsLoaded = null,
    onPageLoaded = null,
    onLoaded = null,
    onError = null,
}) => {
    const isPaginated = getPage !== null || initialPages !== null;
    const lastState = useRef(null);
    const initialState = useMemo(() => {
        const finalInitialPages =
            initialPages !== null ? initialPages.map((it) => getPageFromResponse(it)) : null;
        return {
            lastPage:
                finalInitialPages !== null
                    ? finalInitialPages.reduce(
                          (currentLastPage, { lastPage: initialLastPage }) =>
                              initialLastPage > currentLastPage ? initialLastPage : currentLastPage,
                          -1,
                      )
                    : -1,
            total:
                finalInitialPages !== null
                    ? finalInitialPages[0].total
                    : (providedItems || []).length,
            loaded: providedItems !== null,
            loading: false,
            pages: finalInitialPages !== null ? finalInitialPages : null,
            items: null,
        };
    }, [initialPages, providedItems]);
    const [state, setState] = useState(initialState);
    const { lastPage, loaded, loading, items: stateItems, pages, total } = state;
    const items =
        providedItems ||
        (isPaginated && pages !== null
            ? pages.reduce((pagesItems, { items: pageItems }) => pagesItems.concat(pageItems), [])
            : stateItems) ||
        null;
    const updateState = (update) => setState({ ...state, ...update });
    const updateFromResponse = (response, error = null, reset = false) => {
        if (error !== null) {
            updateState({
                loaded: false,
                loading: false,
            });
            throw error;
        }
        if (isPaginated) {
            const newPage = getPageFromResponse(response);
            const newPages = (reset
                ? [newPage]
                : [...(pages || []).filter((it) => it.page !== newPage.page), newPage]
            ).sort((a, b) => {
                if (a === b) {
                    return 0;
                }
                return a > b ? 1 : -1;
            });
            updateState({
                loaded: true,
                loading: false,
                lastPage: newPage.lastPage,
                total: newPage.total,
                pages: newPages,
            });
            return newPage;
        }
        const newItems = [...getItemsFromResponse(response)];
        updateState({
            loaded: true,
            loading: false,
            items: newItems,
            total: newItems.length,
        });
        return newItems;
    };

    const getNextPage = () => {
        const allPages =
            lastPage !== -1
                ? Array.call(null, ...Array(lastPage)).map((it, index) => index + 1)
                : [];
        const remainingPages = allPages.filter(
            (pageNumber) => pages.findIndex((it) => it.page === pageNumber) === -1,
        );
        const firstItem = remainingPages.length > 0 ? remainingPages.shift() : null;
        return firstItem !== null ? firstItem : null;
    };

    const loadItems = (requestPage) => {
        updateState({
            loading: true,
        });
        let canceled = false;
        const request = isPaginated ? getPage(requestPage, count) : getItems();
        const promise = request
            .then((response) => (!canceled ? updateFromResponse(response) : Promise.reject()))
            .catch((error) => (!canceled ? updateFromResponse(null, error) : Promise.reject()))
            .then((response) => {
                if (isPaginated && onPageLoaded !== null) {
                    onPageLoaded(response);
                } else if (!isPaginated && onItemsLoaded !== null) {
                    onItemsLoaded(response);
                }
                if (onLoaded !== null) {
                    onLoaded(response);
                }
                return response;
            })
            .catch((error) => {
                if (!canceled && onError !== null) {
                    onError(error);
                }
            });
        promise.cancel = () => {
            canceled = true;
        };
        return promise;
    };

    const loadPage = (pageToLoad) => {
        if (loading) {
            return Promise.reject();
        }
        if (pages.find((it) => it.page === pageToLoad) !== -1) {
            return Promise.reject();
        }
        return loadItems(pageToLoad);
    };

    const loadNextPage = () => {
        if (loading) {
            return Promise.reject();
        }
        const nextPage = getNextPage();
        return nextPage !== null ? loadItems(nextPage) : Promise.resolve();
    };

    useEffect(() => {
        const hadState = lastState.current !== null;
        lastState.current = initialState;
        if (hadState) {
            setState(initialState);
        }
    }, [initialState]);

    useEffect(() => {
        if ((getPage === null && getItems === null) || providedItems !== null) {
            return () => {};
        }
        let loadPromise = null;
        const pageToLoad = isPaginated && initialPages === null && page === null ? 1 : page;
        if (!isPaginated || pageToLoad !== null) {
            loadPromise = loadItems(pageToLoad);
        }
        return () => {
            if (loadPromise !== null) {
                loadPromise.cancel();
            }
        };
    }, [getPage, getItems, page]);

    const currentPage =
        isPaginated && pages !== null
            ? pages.find(
                  ({ page: pageNumber }) => parseInt(pageNumber, 10) === parseInt(page, 10),
              ) || null
            : null;

    return {
        items,
        pages,
        pageItems: currentPage !== null ? currentPage.items : null,
        total,
        lastPage,
        loaded,
        allLoaded:
            (!isPaginated && loaded) ||
            (lastPage !== -1 && isPaginated && pages.length === lastPage),
        loading,
        loadNextPage,
        loadPage,
    };
};

export default useItems;
