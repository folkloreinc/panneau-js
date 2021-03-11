import { useCallback, useMemo } from 'react';

import { useFieldsManager } from '../contexts';
import { MediasParser } from '../lib';

const useMediasParser = () => {
    // const screensManager = useScreensManager();
    const fieldsManager = useFieldsManager();

    // Convert medias object to path
    const parser = useMemo(
        () =>
            new MediasParser({
                // screensManager,
                fieldsManager,
            }),
        [fieldsManager],
    );
    const toPath = useCallback((story) => parser.toPath(story), [parser]);
    const fromPath = useCallback((story) => parser.fromPath(story), [parser]);

    return { toPath, fromPath, parser };
};

export default useMediasParser;
