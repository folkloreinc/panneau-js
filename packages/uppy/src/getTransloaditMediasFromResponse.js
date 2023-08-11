const convertToMedia = (it) => {
    // console.log('upload', it);
    const type = it.data.type.split('/')[0];
    const thumbnail = it.transloadit[`${type}_thumbnail`] || null;
    const original = it.transloadit[`${type}_original`] || null;
    return {
        handle: it.id,
        type,
        name: it.meta.name,
        mime: it.data.type,
        size: it.data.size,
        url: original !== null ? original.ssl_url || original.url : null,
        thumbnail_url: thumbnail !== null ? thumbnail.ssl_url || thumbnail.url : null,
        metadata: {
            ...(original !== null ? original.meta || null : null),
            ...(it.meta.user ? { user: it.meta.user } || null : null),
            filename: it.meta.filename,
            transloadit: it.transloadit.results || null,
        },
    };
};

const getTransloaditMediasFromResponse = (response) => response.successful
    .map((it) => {
        const transloadit =
            response.transloadit.find(
                (subIt) => subIt.assembly_id === it.transloadit.assembly,
            ) || null;
        const results = transloadit !== null ? transloadit.results || null : null;
        return {
            ...it,
            transloadit:
                results !== null
                    ? Object.keys(results).reduce((map, resultKey) => {
                          const result = results[resultKey].find(
                              (itResult) => itResult.name === it.name,
                          );
                          return result !== null
                              ? {
                                    ...map,
                                    [resultKey]: result,
                                }
                              : map;
                      }, null)
                    : null,
        };
    })
    .filter((it) => it.transloadit !== null)
    .map((it) => convertToMedia(it))

export default getTransloaditMediasFromResponse;
