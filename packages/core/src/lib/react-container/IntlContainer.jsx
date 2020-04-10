import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, addLocaleData } from 'react-intl';
import { hasLocaleData } from 'react-intl/src/locale-data-registry';

import EnLocaleData from 'react-intl/locale-data/en';
import FrLocaleData from 'react-intl/locale-data/fr';

const localeDataSet = {
    fr: FrLocaleData,
    en: EnLocaleData,
};

const propTypes = {
    /* eslint-disable react/no-unused-prop-types */
    locale: PropTypes.string,
    messages: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.string),
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    ]),
    getLocale: PropTypes.func,
    getMessages: PropTypes.func,
    /* eslint-enable react/no-unused-prop-types */
    children: PropTypes.node,
};

const defaultProps = {
    locale: 'en',
    messages: {},
    getLocale: null,
    getMessages: null,
    children: null,
};

class IntlContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            locales: {}, // eslint-disable-line react/no-unused-state
        };
    }

    componentDidMount() {
        const locale = this.getLocale();
        this.loadLocaleData(locale);
    }

    componentDidUpdate(prevProps) {
        const prevLocale = this.getLocale(prevProps);
        const locale = this.getLocale();
        const localeChanged = prevLocale !== locale;
        if (localeChanged) {
            this.loadLocaleData(locale);
        }
    }

    getLocale(props) {
        const { getLocale, locale } = props || this.props;
        return getLocale !== null ? getLocale() : locale;
    }

    getMessages(props) {
        const { getMessages, messages } = props || this.props;
        const locale = this.getLocale(props);
        return getMessages !== null ? getMessages(locale) : messages[locale] || messages;
    }

    loadLocaleData(locale) {
        if (hasLocaleData(locale)) {
            return;
        }
        if (localeDataSet[locale]) {
            const localeData = localeDataSet[locale];
            addLocaleData(localeData);
            this.setState(state => ({
                locales: {
                    ...state.locales,
                    [locale]: localeData,
                },
            }));
        }
    }

    render() {
        const {
            children, getLocale, getMessages, ...props
        } = this.props;
        const locale = this.getLocale();

        if (!hasLocaleData(locale)) {
            return null;
        }

        return (
            <IntlProvider {...props} locale={locale} messages={this.getMessages()}>
                {children}
            </IntlProvider>
        );
    }
}

IntlContainer.propTypes = propTypes;
IntlContainer.defaultProps = defaultProps;

export default IntlContainer;
