import { useCallback, useMemo } from 'react';

import { MediasParser } from '../lib';

import { useFieldsManager } from '../contexts';

type Story = Parameters<MediasParser['toPath']>[0];

interface UseMediasParserReturn {
    toPath: (story: Story) => Story;
    fromPath: (story: Story) => Story;
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
    const toPath = useCallback((story: Story): Story => parser.toPath(story), [parser]);
    const fromPath = useCallback((story: Story): Story => parser.fromPath(story), [parser]);

    return { toPath, fromPath, parser };
}

export default useMediasParser;
