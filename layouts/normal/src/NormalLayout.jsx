import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header, Footer } from '@panneau/layout';
import get from 'lodash/get';
import { connect } from 'react-redux';

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
    goto: PropTypes.func.isRequired,
};

const defaultProps = {
    children: null,
    applicationDefinition: null,
    definition: null,
};

class NormalLayout extends Component {
    constructor(props) {
        super(props);

        this.onHeaderClickMenuItem = this.onHeaderClickMenuItem.bind(this);
    }

    onHeaderClickMenuItem() {

    }

    render() {
        const {
            children,
            applicationDefinition,
            definition,
            gotoHome,
            goto,
        } = this.props;

        const header = get(definition, 'header', true);
        const footer = get(definition, 'footer', true);

        console.log(applicationDefinition);

        return (
            <div className={styles.container}>
                { header !== false ? (
                    <div className={styles.header}>
                        <Header
                            title={applicationDefinition.name}
                            {...header}
                            gotoHome={gotoHome}
                            goto={goto}
                            onClickMenuItem={this.onHeaderClickMenuItem}
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

NormalLayout.propTypes = propTypes;
NormalLayout.defaultProps = defaultProps;

const mapStateToProps = () => ({

});

const mapDispatchToProps = () => ({

});

const WithStoreContainer = connect(mapStateToProps, mapDispatchToProps)(NormalLayout);
export default WithStoreContainer;
