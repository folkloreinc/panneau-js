/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash-es/isObject';
import type { ReactNode } from 'react';
import { createContext, use, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import slugify from 'slugify';
import { v1 as uuid } from 'uuid';

import getTransloaditMediasFromResponse from './getTransloaditMediasFromResponse';
import useUppyCore from './useUppyCore';
import useUppyLocale from './useUppyLocale';
import useUppySources from './useUppySources';
import useUppyTransport from './useUppyTransport';

type UppyTransportType = 'xhr' | 'transloadit' | 'tus';
type UppySourceId = 'webcam' | 'facebook' | 'instagram' | 'dropbox' | 'google-drive';

interface UppyFileLike {
    name?: string;
    extension?: string | null;
    [key: string]: unknown;
}

interface UppyCompleteResponse {
    successful?: unknown[];
    failed?: unknown;
    [key: string]: unknown;
}

interface UppyTransloaditConfig {
    key?: string;
    templateId?: string;
    waitForEncoding?: boolean;
    [key: string]: unknown;
}

interface UppyCompanionConfig {
    url: string;
    allowedHosts: string;
}

type UppyEndpointConfig =
    | string
    | {
          endpoint: string;
          [key: string]: unknown;
      };

interface UppyBuildOptions {
    sources?: UppySourceId[] | null;
    [key: string]: unknown;
}

interface UppyPlugin {
    [key: string]: unknown;
}

interface UppyTransportPlugin extends UppyPlugin {
    COMPANION?: string;
    COMPANION_PATTERN?: string;
}

interface UppyInstanceLike {
    on: (eventName: string, callback: (...args: unknown[]) => void) => void;
    off: (eventName: string, callback: (...args: unknown[]) => void) => void;
    getFile: (id: string) => UppyFileLike;
    setFileMeta: (id: string, meta: Record<string, unknown>) => void;
    use: (plugin: unknown, options?: Record<string, unknown>) => UppyInstanceLike;
    [key: string]: unknown;
}

type UppyConstructor = new (options: Record<string, unknown>) => UppyInstanceLike;

interface UppyContextValue {
    id?: string;
    transport?: UppyTransportType | null;
    locale?: string | null;
    sources?: UppySourceId[] | null;
    transloadit?: UppyTransloaditConfig | null;
    companion?: UppyCompanionConfig | null;
    tus?: UppyEndpointConfig | null;
    xhr?: UppyEndpointConfig | null;
    Uppy?: UppyConstructor | null;
    uppyTransport?: UppyTransportPlugin | null;
    uppySources?: Record<string, UppyPlugin> | null;
    uppyLocale?: Record<string, unknown> | null;
    buildUppy?: ((opts?: UppyBuildOptions) => UppyInstanceLike) | null;
}

interface UseUppyOptions {
    onComplete?: ((successful: unknown[]) => void) | null;
    onFail?: ((failed: unknown) => void) | null;
    getFileName?: (file: UppyFileLike) => string | null;
    getFileNameWithUUID?: (file: UppyFileLike) => string | null;
    withUUID?: boolean;
    meta?: Record<string, unknown> | null;
    allowMultipleUploads?: boolean;
    maxNumberOfFiles?: number;
    allowedFileTypes?: string[] | null;
    autoProceed?: boolean;
    debug?: boolean;
}

export const UppyContext = createContext<UppyContextValue | null>(null);

export function useUppyConfig() {
    const {
        transport = null,
        locale = null,
        sources = null,
        transloadit = null,
        companion = null,
        tus = null,
        xhr = null,
    } = use(UppyContext) || {};

    return {
        transport,
        locale,
        sources,
        transloadit,
        companion,
        tus,
        xhr,
    };
}

export function useUppy({
    onComplete = null,
    onFail = null,
    getFileName = ({ name = '', extension = null }) =>
        `${(slugify(name) || '').substring(0, 160)}${
            extension !== null && (name || '').indexOf(extension) === -1 ? `.${extension}` : ''
        }`,
    getFileNameWithUUID = ({ extension = null }) =>
        `${uuid()}${extension !== null ? `.${extension}` : ''}`,
    withUUID = false,
    meta = null,
    allowMultipleUploads = false,
    maxNumberOfFiles = 1,
    allowedFileTypes = null,
    autoProceed = false,
    debug = false,
}: UseUppyOptions = {}): UppyInstanceLike | null {
    const { buildUppy, transport } = use(UppyContext) || {};

    const uppy = useMemo(
        () =>
            typeof buildUppy === 'function'
                ? buildUppy({
                      meta,
                      allowMultipleUploadBatches: allowMultipleUploads,
                      restrictions: { maxNumberOfFiles, allowedFileTypes },
                      autoProceed,
                      debug,
                  })
                : null,
        [
            buildUppy,
            meta,
            allowMultipleUploads,
            debug,
            maxNumberOfFiles,
            allowedFileTypes,
            autoProceed,
        ],
    );

    useEffect(() => {
        if (uppy === null) {
            return () => {};
        }
        function onUppyComplete(response: UppyCompleteResponse) {
            const { successful = [], failed = null } = response;
            const finalSuccessful =
                transport === 'transloadit'
                    ? getTransloaditMediasFromResponse(response)
                    : successful;
            if (onComplete !== null) {
                onComplete(finalSuccessful);
            }
            if (onFail !== null) {
                onFail(failed);
            }
        }
        uppy.on('complete', onUppyComplete);
        return () => {
            uppy.off('complete', onUppyComplete);
        };
    }, [uppy, transport, onComplete]);

    useEffect(() => {
        if (uppy === null) {
            return () => {};
        }
        function onUpload({ fileIDs: ids = [] }: { fileIDs?: string[] }) {
            ids.forEach((id) => {
                const file = uppy.getFile(id);
                // console.log('file', id, file);
                let newName = null;
                if (withUUID) {
                    newName = getFileNameWithUUID(file);
                } else {
                    newName = getFileName(file);
                }
                if (newName !== null) {
                    uppy.setFileMeta(id, {
                        name: newName,
                    });
                }
            });
        }
        uppy.on('upload', onUpload);
        return () => {
            uppy.off('upload', onUpload);
        };
    }, [uppy]);

    // useEffect(
    //     () => () => {
    //         if (uppy !== null) {
    //             uppy.close();
    //         }
    //     },
    //     [uppy],
    // );

    return uppy;
}

const DEFAULT_UPPY_SOURCES: UppySourceId[] = [
    'webcam',
    'facebook',
    'instagram',
    'dropbox',
    'google-drive',
];

interface UppyProviderProps {
    id?: string;
    children: ReactNode;
    transport?: UppyTransportType | null;
    locale?: string | null;
    sources?: UppySourceId[] | null;
    transloadit?: UppyTransloaditConfig | null;
    companion?: UppyCompanionConfig | null;
    tus?: UppyEndpointConfig | null;
    xhr?: UppyEndpointConfig | null;
}

export function UppyProvider({
    id = 'uppy',
    children,
    transport: providedTransport = null,
    locale: providedLocale = null,
    sources: providedSources = null,
    transloadit: providedTransloadit = null,
    companion: providedCompanion = null,
    tus: providedTus = null,
    xhr: providedXhr = null,
}: UppyProviderProps) {
    const { locale: intlLocale } = useIntl();

    const {
        transport: contextTransport = null,
        locale: contextLocale = null,
        sources: contextSources = null,
        transloadit: contextTransloadit = null,
        companion: contextCompanion = null,
        tus: contextTus = null,
        xhr: contextXhr = null,
    } = use(UppyContext) || {};

    const transport = providedTransport || contextTransport || 'xhr';
    const locale = providedLocale || contextLocale || intlLocale;
    const sources = providedSources || contextSources || DEFAULT_UPPY_SOURCES;
    const transloadit = providedTransloadit || contextTransloadit;
    const companion = providedCompanion || contextCompanion;
    const tus = providedTus || contextTus;
    const xhr = providedXhr || contextXhr;

    const Uppy = useUppyCore() as UppyConstructor | null;
    const uppyTransport = useUppyTransport(transport) as UppyTransportPlugin | null;
    const uppySources = useUppySources(sources) as Record<string, UppyPlugin> | null;
    const uppyLocale = useUppyLocale(locale || intlLocale) as Record<string, unknown> | null;

    // console.log('Init uppy', Uppy, uppyTransport, uppySources, uppyLocale);

    const buildUppy = useMemo(() => {
        if (
            Uppy === null ||
            uppyTransport === null ||
            uppySources === null ||
            uppyLocale === null
        ) {
            return null;
        }
        return (opts: UppyBuildOptions = {}) => {
            const { sources: customSources = sources, ...uppyOpts } = opts || {};
            // console.log('Uppy opts buildUppy', opts);
            const newUppy = new Uppy({
                id,
                locale: uppyLocale,
                ...uppyOpts,
            });
            if (transport === 'transloadit') {
                const {
                    key,
                    templateId,
                    waitForEncoding = true,
                    ...transloaditOpts
                } = transloadit || {};
                newUppy.use(uppyTransport, {
                    params: {
                        auth: { key },
                        template_id: templateId,
                        ...transloaditOpts,
                    },
                    waitForEncoding,
                });
            } else if (transport === 'tus') {
                const tusOptions = typeof tus === 'string' ? { endpoint: tus } : tus || {};
                newUppy.use(uppyTransport, {
                    endpoint: '/tus',
                    // resume: true, obsolete
                    retryDelays: [0, 1000, 3000, 5000],
                    ...tusOptions,
                });
            } else if (transport === 'xhr') {
                const xhrOptions = typeof xhr === 'string' ? { endpoint: xhr } : xhr || {};
                newUppy.use(uppyTransport, {
                    endpoint: '/upload',
                    ...(isObject(xhrOptions) ? xhrOptions : {}),
                });
            }

            if (transport === 'transloadit' || companion !== null) {
                const finalSources = customSources || sources || [];
                return finalSources.reduce((currentUppy, sourceId) => {
                    const source = uppySources[sourceId] || null;
                    if (source === null) {
                        return currentUppy;
                    }
                    const { url: companionUrl, allowedHosts: companionAllowedHosts } =
                        companion || {
                            url: uppyTransport.COMPANION || null,
                            allowedHosts: uppyTransport.COMPANION_PATTERN || null,
                        };
                    return newUppy.use(source, {
                        id: sourceId,
                        companionUrl,
                        companionAllowedHosts,
                    });
                }, newUppy);
            }

            return newUppy;
        };
    }, [
        id,
        Uppy,
        uppyLocale,
        uppyTransport,
        uppySources,
        transport,
        sources,
        transloadit,
        companion,
        tus,
        xhr,
    ]);

    const value = useMemo(
        () => ({
            id,
            transport,
            locale,
            sources,
            transloadit,
            companion,
            tus,
            xhr,
            Uppy,
            uppyTransport,
            uppySources,
            uppyLocale,
            buildUppy,
        }),
        [
            id,
            transport,
            locale,
            sources,
            transloadit,
            companion,
            tus,
            xhr,
            Uppy,
            uppyTransport,
            uppySources,
            uppyLocale,
            buildUppy,
        ],
    );

    return <UppyContext value={value}>{children}</UppyContext>;
}
