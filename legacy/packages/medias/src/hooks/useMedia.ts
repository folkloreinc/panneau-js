import { type Media } from '@panneau/core';
import { useItem } from '@panneau/data';

import { useMediasApi } from '../MediasApiContext';

function useMedia(id: string, opts) {
    const api = useMediasApi();
    const loader = (id: string) => api.find(id);
    const { item, ...request } = useItem<Media>('medias', id, loader, opts);
    return {
        media: item,
        ...request,
    };
}

export default useMedia;
