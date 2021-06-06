/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

const defaultLocales = ['en', 'fr'];

export const LocalesContext = React.createContext({ locales: defaultLocales });

export const useLocales = () => {
    const { locales } = useContext(LocalesContext);
    return locales;
};

export const useOtherLocales = () => {
    const { locales } = useLocales();
    const { locale } = useIntl();
    const otherLocales = useMemo(() => locales.filter((it) => it !== locale), [locales, locale]);
    return otherLocales;
};

const propTypes = {
    locales: PropTypes.arrayOf(PropTypes.string),
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    locales: [],
};

export const LocalesProvider = ({ locales, children }) => (
    <LocalesContext.Provider value={{ locales }}>{children}</LocalesContext.Provider>
);

LocalesProvider.propTypes = propTypes;
LocalesProvider.defaultProps = defaultProps;

export default LocalesContext;
