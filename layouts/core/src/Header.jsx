import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isObject from 'lodash/isObject';

import Navbar from './Navbar';

import styles from './styles/header.scss';

const propTypes = {
    title: PropTypes.string,
    navbar: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object,
    ]),
    gotoHome: PropTypes.func,
    goto: PropTypes.func,
};

const defaultProps = {
    title: 'Panneau',
    navbar: true,
    gotoHome: null,
    goto: null,
};

class Header extends Component {
    constructor(props) {
        super(props);

        this.onNavbarClickTitle = this.onNavbarClickTitle.bind(this);
        this.onNavbarClickItem = this.onNavbarClickItem.bind(this);
    }

    onNavbarClickTitle(e) {
        const { gotoHome } = this.props;
        if (gotoHome !== null) {
            e.preventDefault();
            gotoHome();
        }
    }

    onNavbarClickItem(e, it) {
        const { goto } = this.props;
        const link = get(it, 'link', null);
        const dropdown = get(it, 'dropdown', false);
        if (link !== null && goto !== null && !dropdown) {
            e.preventDefault();
            goto(link);
        }
    }

    render() {
        const {
            title,
            navbar,
        } = this.props;

        return (
            <div className={styles.container}>
                { navbar !== false ? (
                    <div className={styles.navbar}>
                        <Navbar
                            title={title}
                            {...(isObject(navbar) ? navbar : null)}
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

export default Header;
