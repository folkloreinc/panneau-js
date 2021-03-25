import SearchFilter from '@panneau/filter-search';

const filters = { SearchFilter };

export const filtersArray = Object.keys(filters).map((name) => filters[name]);

export default filters;
