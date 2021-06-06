import { usePanneauColorScheme } from '@panneau/core/contexts';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import MainNavbar from '../menus/MainNavbar';

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
        <div className={classNames(['d-flex', 'flex-column', 'min-vh-100'])}>
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
