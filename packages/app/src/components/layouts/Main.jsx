import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { usePanneauColorScheme } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

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
    const { theme = null, background = null, text = null } = usePanneauColorScheme();

    return (
        <div
            className={classNames([styles.container, 'd-flex', 'flex-column', 'min-vh-100'])}
            data-bs-theme={theme !== null ? theme : null}
        >
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
            <Modals />
        </div>
    );
};
MainLayout.propTypes = propTypes;
MainLayout.defaultProps = defaultProps;

export default MainLayout;
