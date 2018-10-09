import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header, Footer } from '@panneau/layout';
import get from 'lodash/get';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    applicationDefinition: PropTypes.shape({
        name: PropTypes.string,
    }),
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
    gotoHome: PropTypes.func.isRequired,
    gotoLink: PropTypes.func.isRequired,
    gotoRoute: PropTypes.func.isRequired,
};

const defaultProps = {
    children: null,
    applicationDefinition: null,
    definition: null,
};

class NormalLayout extends Component {
    constructor(props) {
        super(props);

        this.onHeaderNavbarClickItem = this.onHeaderNavbarClickItem.bind(this);
    }

    // eslint-disable-next-line
    onHeaderNavbarClickItem() {}

    render() {
        const {
            children,
            applicationDefinition,
            definition,
            gotoHome,
            gotoLink,
            gotoRoute,
            ...props
        } = this.props;

        const title = get(applicationDefinition, 'name', 'Panneau');
        const header = get(definition, 'header', true);
        const footer = get(definition, 'footer', true);

        return (
            <div className={styles.container}>
                { header !== false ? (
                    <div className={styles.header}>
                        <Header
                            {...props}
                            title={title}
                            {...header}
                            gotoHome={gotoHome}
                            gotoLink={gotoLink}
                            gotoRoute={gotoRoute}
                            onNavbarClickItem={this.onHeaderNavbarClickItem}
                        />
                    </div>
                ) : null }

                <div className={styles.content}>
                    { children }
                </div>

                { footer !== false ? (
                    <div className={styles.footer}>
                        <Footer
                            {...props}
                            {...footer}
                        />
                    </div>
                ) : null }
            </div>
        );
    }
}

NormalLayout.propTypes = propTypes;
NormalLayout.defaultProps = defaultProps;

export default NormalLayout;
