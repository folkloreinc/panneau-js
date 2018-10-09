import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import { PropTypes as PanneauPropTypes, withUrlGenerator } from '@panneau/core';

import Navbar from './Navbar';

import styles from './styles/header.scss';

const propTypes = {
    urlGenerator: PanneauPropTypes.urlGenerator,
    title: PropTypes.string,
    titleLink: PropTypes.string,
    navbar: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object,
    ]),
    gotoHome: PropTypes.func.isRequired,
    gotoLink: PropTypes.func.isRequired,
    gotoRoute: PropTypes.func.isRequired,
    onNavbarClickTitle: PropTypes.func,
    onNavbarClickItem: PropTypes.func,
};

const defaultProps = {
    urlGenerator: null,
    title: 'Panneau',
    titleLink: '/',
    navbar: true,
    onNavbarClickTitle: null,
    onNavbarClickItem: null,
};

class Header extends Component {
    constructor(props) {
        super(props);

        this.onNavbarClickTitle = this.onNavbarClickTitle.bind(this);
        this.onNavbarClickItem = this.onNavbarClickItem.bind(this);
    }

    onNavbarClickTitle(...args) {
        const { onNavbarClickTitle } = this.props;
        if (onNavbarClickTitle !== null) {
            onNavbarClickTitle(...args);
        }
    }

    onNavbarClickItem(...args) {
        const { onNavbarClickItem } = this.props;
        if (onNavbarClickItem !== null) {
            onNavbarClickItem(...args);
        }
    }

    render() {
        const {
            urlGenerator,
            titleLink,
            navbar,
            onNavbarClickTitle,
            onNavbarClickItem,
            gotoHome,
            gotoLink,
            gotoRoute,
            ...props
        } = this.props;

        return (
            <div className={styles.container}>
                { navbar !== false ? (
                    <div className={styles.navbar}>
                        <Navbar
                            titleLink={urlGenerator !== null ? urlGenerator.route('home') : titleLink}
                            {...props}
                            {...(isObject(navbar) ? navbar : null)}
                            gotoHome={gotoHome}
                            gotoLink={gotoLink}
                            gotoRoute={gotoRoute}
                            onClickTitle={this.onNavbarClickTitle}
                            onClickItem={this.onNavbarClickItem}
                        />
                    </div>
                ) : null }
            </div>
        );
    }
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default withUrlGenerator()(Header);
