import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Label from '@panneau/element-label';

const propTypes = {
    title: PanneauPropTypes.label,
    actions: PropTypes.node,
    small: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    title: null,
    actions: null,
    small: false,
    className: null,
    children: null,
};

const PageHeader = ({ title, actions, small, className, children }) => {
    const inner = (
        <div className="d-flex align-items-center flex-wrap">
            {title !== null ? (
                <h1 className="mb-0">
                    <Label>{title}</Label>
                </h1>
            ) : null}
            {actions !== null ? <div className="ms-auto">{actions}</div> : null}
        </div>
    );
    return (
        <div
            className={classNames([
                'bg-light',
                'py-4',
                {
                    [className]: className !== null,
                },
            ])}
        >
            <div className="container-sm">
                {small ? (
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">{inner}</div>
                    </div>
                ) : (
                    inner
                )}
            </div>
            {children}
        </div>
    );
};
PageHeader.propTypes = propTypes;
PageHeader.defaultProps = defaultProps;

export default PageHeader;
