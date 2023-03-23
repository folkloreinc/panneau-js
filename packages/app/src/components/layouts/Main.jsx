import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { usePanneauColorScheme } from '@panneau/core/contexts';

import MainNavbar from '../menus/MainNavbar';

import styles from '../../styles/layouts/main.module.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
    fullscreen: PropTypes.bool,
};

const defaultProps = {
    fullscreen: false,
};

const MainLayout = ({ children, fullscreen }) => {
    const { background, text } = usePanneauColorScheme();
    return (
        <div className={classNames([styles.container, 'd-flex', 'flex-column', 'min-vh-100'])}>
            <MainNavbar className={classNames(['border-bottom', 'sticky-top', 'px-3'])} />
            <div
                className={classNames([
                    'flex-grow-1',
                    {
                        'd-flex flex-column': fullscreen,
                        [`bg-${background}`]: background !== null,
                        [`text-${text}`]: text !== null,
                    },
                ])}
            >
                {children}
            </div>
        </div>
    );
};
MainLayout.propTypes = propTypes;
MainLayout.defaultProps = defaultProps;

export default MainLayout;
