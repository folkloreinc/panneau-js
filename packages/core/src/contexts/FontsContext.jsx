/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import uniqBy from 'lodash/uniqBy';
import isObject from 'lodash/isObject';
import { getJSON } from '@folklore/fetch';

import { PropTypes as PanneauPropTypes } from '../lib';

import { useGoogleKeys } from './GoogleKeysContext';

export const FontsContext = React.createContext({
    systemFonts: null,
    googleFonts: null,
    customFonts: null,
});

export const useGoogleFonts = ({ disabled = false, setFonts = null } = {}) => {
    const { apiKey } = useGoogleKeys();
    const [googleFonts, setGoogleFonts] = useState(null);
    useEffect(() => {
        let canceled = false;
        if (apiKey !== null && !disabled) {
            getJSON(
                `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`,
            ).then(({ items = [] }) => {
                if (!canceled) {
                    const newFonts = items.map((it) => ({
                        type: 'google',
                        name: it.family,
                        variants: it.variants,
                    }));
                    if (setFonts !== null) {
                        setFonts(newFonts);
                    } else {
                        setGoogleFonts(newFonts);
                    }
                }
            });
        }
        return () => {
            canceled = true;
        };
    }, [apiKey, disabled, setFonts, setGoogleFonts]);
    return googleFonts;
};

export const useFonts = ({ withoutGoogleFonts = false } = {}) => {
    const {
        setGoogleFonts = null,
        systemFonts = null,
        googleFonts = null,
        customFonts = null,
    } = useContext(FontsContext);

    useGoogleFonts({
        disabled: withoutGoogleFonts || (googleFonts !== null && googleFonts.length > 0),
        setFonts: setGoogleFonts,
    });

    const fonts = useMemo(
        () => ({
            systemFonts,
            googleFonts,
            customFonts,
        }),
        [systemFonts, googleFonts, customFonts],
    );

    return fonts;
};

const propTypes = {
    children: PropTypes.node.isRequired,
    systemFonts: PanneauPropTypes.fonts,
    customFonts: PanneauPropTypes.fonts,
};

const defaultProps = {
    systemFonts: ['Arial', 'Courier', 'Georgia', 'Times New Roman', 'Verdana'],
    customFonts: null,
};

export const FontsProvider = ({ systemFonts, customFonts, children }) => {
    const {
        systemFonts: previousSystemFonts = null,
        googleFonts: previousGoogleFonts = null,
        customFonts: previousCustomFonts,
    } = useFonts();

    const [googleFonts, setGoogleFonts] = useState(null);

    const fonts = useMemo(
        () => ({
            systemFonts: uniqBy([...(previousSystemFonts || []), ...(systemFonts || [])], (font) =>
                isObject(font) ? font.name : font,
            ),
            googleFonts: uniqBy([...(previousGoogleFonts || []), ...(googleFonts || [])], (font) =>
                isObject(font) ? font.name : font,
            ),
            customFonts: uniqBy([...(previousCustomFonts || []), ...(customFonts || [])], (font) =>
                isObject(font) ? font.name : font,
            ),
            setGoogleFonts,
        }),
        [
            previousSystemFonts,
            previousGoogleFonts,
            previousCustomFonts,
            customFonts,
            systemFonts,
            googleFonts,
            setGoogleFonts,
        ],
    );

    return <FontsContext.Provider value={fonts}>{children}</FontsContext.Provider>;
};

FontsProvider.propTypes = propTypes;
FontsProvider.defaultProps = defaultProps;
