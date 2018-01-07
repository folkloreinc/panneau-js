import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header, Footer } from '@panneau/layout';
import get from 'lodash/get';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    definition: PropTypes.shape({
        header: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.object,
        ]),
        footer: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.object,
        ]),
    }),
};

const defaultProps = {
    children: null,
    definition: null,
};

class <%= componentName %> extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            children,
            definition,
        } = this.props;

        const header = get(definition, 'header', true);
        const footer = get(definition, 'footer', true);

        return (
            <div className={styles.container}>
                { header !== false ? (
                    <div className={styles.header}>
                        <Header
                            {...header}
                        />
                    </div>
                ) : null }

                <div className={styles.content}>
                    { children }
                </div>

                { footer !== false ? (
                    <div className={styles.footer}>
                        <Footer
                            {...footer}
                        />
                    </div>
                ) : null }
            </div>
        );
    }
}

<%= componentName %>.propTypes = propTypes;
<%= componentName %>.defaultProps = defaultProps;

export default <%= componentName %>;
