/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import slugify from 'slugify';
import { v1 as uuid } from 'uuid';

import useUppyCore from '../hooks/useUppyCore';
import useUppyLocale from '../hooks/useUppyLocale';
import useUppySources from '../hooks/useUppySources';
import useUppyTransport from '../hooks/useUppyTransport';
import getTransloaditMediasFromResponse from '../utils/getTransloaditMediasFromResponse';

export const UppyContext = React.createContext(null);

export const useUppy = ({
    onComplete = null,
    onFail = null,
    getFileName = ({ name = '', extension = null }) =>
        `${(slugify(name) || '').substring(0, 50)}${
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
} = {}) => {
    const { buildUppy, transport } = useContext(UppyContext) || null;

    const uppy = useMemo(
        () =>
            buildUppy !== null
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
        const onUppyComplete = (response) => {
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
        };
        uppy.on('complete', onUppyComplete);
        return () => {
            uppy.off('complete', onUppyComplete);
        };
    }, [uppy, transport, onComplete]);

    useEffect(() => {
        if (uppy === null) {
            return () => {};
        }
        const onUpload = ({ fileIDs: ids = [] }) => {
            ids.forEach((id) => {
                const file = uppy.getFile(id);
                console.log('file', id, file);

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
        };
        uppy.on('upload', onUpload);
        return () => {
            uppy.off('upload', onUpload);
        };
    }, [uppy]);

    useEffect(
        () => () => {
            if (uppy !== null) {
                uppy.close();
            }
        },
        [uppy],
    );

    return uppy;
};

const propTypes = {
    id: PropTypes.string,
    children: PropTypes.node.isRequired,
    transport: PropTypes.oneOf(['xhr', 'transloadit', 'tus']),
    locale: PropTypes.string,
    sources: PropTypes.arrayOf(
        PropTypes.oneOf(['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive']),
    ),
    transloadit: PropTypes.shape({
        key: PropTypes.string.isRequired,
        templateId: PropTypes.string,
        waitForEncoding: PropTypes.bool,
    }),
    companion: PropTypes.shape({
        url: PropTypes.string.isRequired,
        allowedHosts: PropTypes.string.isRequired,
    }),
    tus: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            endpoint: PropTypes.string.isRequired,
        }),
    ]),
    xhr: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            endpoint: PropTypes.string.isRequired,
        }),
    ]),
};

const defaultProps = {
    id: 'uppy',
    transport: null,
    locale: null,
    sources: null,
    transloadit: null,
    companion: null,
    tus: null,
    xhr: null,
};

export const UppyProvider = ({
    id,
    children,
    transport: providedTransport,
    locale: providedLocale,
    sources: providedSources,
    transloadit: providedTransloadit,
    companion: providedCompanion,
    tus: providedTus,
    xhr: providedXhr,
}) => {
    const { locale: intlLocale } = useIntl();

    const {
        transport: contextTransport = null,
        locale: contextLocale = null,
        sources: contextSources = null,
        transloadit: contextTransloadit = null,
        companion: contextCompanion = null,
        tus: contextTus = null,
        xhr: contextXhr = null,
    } = useContext(UppyContext) || {};

    const transport = providedTransport || contextTransport || 'xhr';
    const locale = providedLocale || contextLocale || intlLocale;
    const sources = providedSources ||
        contextSources || ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'];
    const transloadit = providedTransloadit || contextTransloadit;
    const companion = providedCompanion || contextCompanion;
    const tus = providedTus || contextTus;
    const xhr = providedXhr || contextXhr;

    const Uppy = useUppyCore();
    const uppyTransport = useUppyTransport(transport);
    const uppySources = useUppySources(sources);
    const uppyLocale = useUppyLocale(locale || intlLocale);

    const buildUppy = useMemo(() => {
        if (
            Uppy === null ||
            uppyLocale === null ||
            uppyTransport === null ||
            uppySources === null
        ) {
            return null;
        }
        return (opts = {}) => {
            const { sources: customSources = sources, ...uppyOpts } = opts || {};
            // console.log(uppyOpts);
            const newUppy = new Uppy({
                id,
                locale: uppyLocale,
                ...uppyOpts,
            });
            if (transport === 'transloadit') {
                const { key, templateId, waitForEncoding = true, ...transloaditOpts } = transloadit;
                newUppy.use(uppyTransport, {
                    params: {
                        auth: { key },
                        template_id: templateId,
                        ...transloaditOpts,
                    },
                    waitForEncoding,
                });
            } else if (transport === 'tus') {
                newUppy.use(uppyTransport, {
                    endpoint: '/tus',
                    resume: true,
                    retryDelays: [0, 1000, 3000, 5000],
                    ...tus,
                });
            } else if (transport === 'xhr') {
                newUppy.use(uppyTransport, {
                    endpoint: isString(xhr) ? xhr : '/upload',
                    ...(isObject(xhr) ? xhr : null),
                });
            }

            if (transport === 'transloadit' || companion !== null) {
                return customSources.reduce((currentUppy, sourceId) => {
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

    return <UppyContext.Provider value={value}>{children}</UppyContext.Provider>;
};

UppyProvider.propTypes = propTypes;
UppyProvider.defaultProps = defaultProps;
