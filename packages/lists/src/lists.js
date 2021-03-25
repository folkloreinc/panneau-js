import TableList from '@panneau/list-table';

const lists = { TableList };

export const listsArray = Object.keys(lists).map((name) => lists[name]);

export default lists;
