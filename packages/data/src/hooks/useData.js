import { useState, useEffect, useCallback } from 'react';

const useData = (loadData, { initialData = null, autoload = true } = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState(initialData);

    const load = useCallback(
        (...args) => {
            let canceled = false;
            setLoading(true);
            const promise = loadData(...args)
                .then((newData) => {
                    if (!canceled) {
                        setData(newData);
                        setLoading(false);
                    }
                    return newData;
                })
                .catch((newError) => {
                    setError(newError);
                    setLoading(false);
                });
            promise.cancel = () => {
                canceled = true;
                setLoading(false);
            };
            return promise;
        },
        [loadData, setLoading, setData],
    );

    useEffect(() => {
        let loader = null;
        if (autoload) {
            loader = load();
        }
        return () => {
            if (loader !== null) {
                loader.cancel();
            }
        };
    }, [autoload, load]);
    return {
        data,
        load,
        loading,
        error,
    };
};

export default useData;
