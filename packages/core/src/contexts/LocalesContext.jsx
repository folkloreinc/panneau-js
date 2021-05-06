/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

const LocalesContext = React.createContext(null);

export const useLocalesContext = () => useContext(LocalesContext);

export const useLocale = () => {
    const { locale = null } = useLocalesContext();
    return locale;
};

export const useLocales = () => {
    const { locales = [] } = useLocalesContext();
    return locales;
};

const propTypes = {
    locales: PropTypes.arrayOf(PropTypes.string),
    locale: PropTypes.string,
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    locales: [],
    locale: 'fr',
};

export const LocalesProvider = ({ locales, locale, children }) => (
    <LocalesContext.Provider value={{ locales, locale }}>{children}</LocalesContext.Provider>
);

LocalesProvider.propTypes = propTypes;
LocalesProvider.defaultProps = defaultProps;

export default LocalesContext;
