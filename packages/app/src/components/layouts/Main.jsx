import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { usePanneauColorScheme } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import MainNavbar from '../menus/MainNavbar';

const propTypes = {
    children: PropTypes.node,
    loading: PropTypes.bool,
    fullscreen: PropTypes.bool,
};

const defaultProps = {
    fullscreen: false,
    loading: false,
    children: null,
};

const MainLayout = ({ fullscreen, loading, children }) => {
    const {
        theme = null,
        sidebarPosition = null,
        background = null,
        text = null,
    } = usePanneauColorScheme();

    const vertical = sidebarPosition === 'left' || sidebarPosition === 'right';

    return (
        <div
            className={classNames(['d-flex', 'min-vh-100', { 'flex-column': !vertical }])}
            data-bs-theme={theme !== null ? theme : null}
        >
            <MainNavbar
                className={classNames([
                    {
                        'shadow-sm': !vertical,
                        'border-bottom': !vertical,
                        'sticky-top': !vertical,
                        'px-3': !vertical,
                        'pe-3': vertical && sidebarPosition === 'left',
                        'ps-3': vertical && sidebarPosition === 'right',
                        'me-2': vertical && sidebarPosition === 'left',
                        'ms-2': vertical && sidebarPosition === 'right',
                        // [styles.navbar]: true,
                        // [styles[sidebarPosition]]: sidebarPosition !== null,
                        // [styles.verticalNav]: vertical,
                    },
                ])}
                theme={theme}
                loading={loading}
                vertical={vertical}
            />
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
            <Modals theme={theme} />
        </div>
    );
};
MainLayout.propTypes = propTypes;
MainLayout.defaultProps = defaultProps;

export default MainLayout;
