import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/dist/locale-data/en';
import '@formatjs/intl-relativetimeformat/dist/locale-data/fr';

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

    getLocale(props) {
        const { getLocale, locale } = props || this.props;
        return getLocale !== null ? getLocale() : locale;
    }

    getMessages(props) {
        const { getMessages, messages } = props || this.props;
        const locale = this.getLocale(props);
        return getMessages !== null ? getMessages(locale) : messages[locale] || messages;
    }

    render() {
        const {
            children, getLocale, getMessages, ...props
        } = this.props;
        const locale = this.getLocale();

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
