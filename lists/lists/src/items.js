import { ComponentsCollection } from '@panneau/core';
import Table from '@panneau/list-table';
import { ListActions, Pagination } from '@panneau/list';

const collection = new ComponentsCollection({
    Table,
    ListActions,
    Pagination,
});

export default collection;
