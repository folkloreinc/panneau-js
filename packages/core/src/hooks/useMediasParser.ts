import { useCallback, useMemo } from 'react';

import { MediasParser } from '../lib';

import { useFieldsManager } from '../contexts';

interface UseMediasParserReturn {
    toPath: (story: unknown) => string;
    fromPath: (story: unknown) => unknown;
    parser: MediasParser;
}

function useMediasParser(): UseMediasParserReturn {
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
    const toPath = useCallback((story: unknown): string => parser.toPath(story), [parser]);
    const fromPath = useCallback((story: unknown): unknown => parser.fromPath(story), [parser]);

    return { toPath, fromPath, parser };
}

export default useMediasParser;
