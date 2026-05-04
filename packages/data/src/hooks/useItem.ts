import { useQuery } from '@tanstack/react-query';

import { type Item } from '@panneau/core';

function useItem<T = Item>(scope, id, loader: (id) => Promise<T>, opts = null) {
    const { data = null, ...request } = useQuery<T>({
        queryKey: [scope, id],
        queryFn: ({ queryKey: [, idParam] }) => loader(idParam),
        ...opts,
    });
    return {
        item: data,
        ...request,
    };
}

export default useItem;
