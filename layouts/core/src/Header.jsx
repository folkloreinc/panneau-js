import React from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUrlGenerator } from '@panneau/core/contexts';

import Navbar from './Navbar';

import styles from './styles/header.scss';

const propTypes = {
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
    title: 'Panneau',
    titleLink: '/',
    navbar: true,
    onNavbarClickTitle: null,
    onNavbarClickItem: null,
};

const Header = ({
    titleLink,
    navbar,
    onNavbarClickTitle,
    onNavbarClickItem,
    gotoHome,
    gotoLink,
    gotoRoute,
    ...props
}) => {
    const urlGenerator = useUrlGenerator();
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
                        onClickTitle={onNavbarClickTitle}
                        onClickItem={onNavbarClickItem}
                    />
                </div>
            ) : null }
        </div>
    );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
