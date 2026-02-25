function convertToMedia(it) {
    // console.log('upload', it);
    const { meta = null, transloadit = null, data = null } = it || {};
    const { user = null, name = null, filename = null } = meta || {};

    const type = data.type.split('/')[0];
    const thumbnail = transloadit[`${type}_thumbnail`] || null;
    const original = transloadit[`${type}_original`] || null;

    return {
        handle: it.id,
        type,
        name: name,
        mime: data.type,
        size: data.size,
        url: original !== null ? original.ssl_url || original.url : null,
        thumbnail_url: thumbnail !== null ? thumbnail.ssl_url || thumbnail.url : null,
        metadata: {
            ...(original !== null ? original.meta || null : null),
            ...(user !== null ? { user } : null),
            filename: filename,
            transloadit: transloadit.results || null,
        },
    };
}

function getTransloaditMediasFromResponse(response) {
    return response.successful
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
        .map((it) => convertToMedia(it));
}

export default getTransloaditMediasFromResponse;
