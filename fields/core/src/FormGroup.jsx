/* eslint-disable jsx-a11y/label-has-for */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { FormattedMessage } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { Label } from '@panneau/core/components';
import { isMessage } from '@panneau/core/utils';

const propTypes = {
    children: PropTypes.node,

    className: PropTypes.string,
    name: PropTypes.string,
    labelPrefix: PanneauPropTypes.label,
    label: PanneauPropTypes.label,
    labelSuffix: PanneauPropTypes.label,
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    helpText: PanneauPropTypes.label,

    large: PropTypes.bool,
    small: PropTypes.bool,
    inline: PropTypes.bool,
    asCard: PropTypes.bool,

    collapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    inputOnly: PropTypes.bool,
    withoutMargin: PropTypes.bool,
};

const defaultProps = {
    children: null,

    className: 'text',
    name: null,
    labelPrefix: null,
    label: null,
    labelSuffix: null,
    errors: [],
    helpText: null,

    large: false,
    small: false,
    inline: false,
    asCard: false,

    collapsible: false,
    collapsed: false,
    inputOnly: false,
    withoutMargin: false,
};

class FormGroup extends Component {
    constructor(props) {
        super(props);
        this.onCollapseChange = this.onCollapseChange.bind(this);
        this.renderError = this.renderError.bind(this);

        this.state = {
            collapsed: props.collapsed,
        };
    }

    onCollapseChange(e) {
        e.preventDefault();
        this.setState(({ collapsed }) => ({
            collapsed: !collapsed,
        }));
    }

    renderErrors() {
        const { errors } = this.props;
        if (!errors || errors.length < 1) {
            return null;
        }
        const items = isArray(errors) ? errors : [errors];
        return items.map(this.renderError).filter(it => it !== null);
    }

    // eslint-disable-next-line class-methods-use-this
    renderError(error, key) {
        if (!error || !error.length) {
            return null;
        }
        const errorKey = `error_${key}`;
        return (
            <span key={errorKey} className="invalid-feedback" style={{ display: 'block' }}>
                {error}
            </span>
        );
    }

    renderHelp() {
        const { helpText } = this.props;
        if (!helpText) {
            return null;
        }
        return (
            <small className="form-text text-muted">
                <Label>{helpText}</Label>
            </small>
        );
    }

    renderLabel() {
        const {
            label,
            labelPrefix,
            labelSuffix,
            name,
            large,
            small,
            asCard,
            collapsible,
        } = this.props;
        const { collapsed } = this.state;

        const caret = (
            <span
                className={classNames({
                    fas: true,
                    'fa-caret-down': !collapsed,
                    'fa-caret-right': collapsed,
                })}
            />
        );

        const labelNode = isMessage(label) ? <FormattedMessage {...label} /> : label;

        const link = collapsible ? (
            <button type="button" className="btn" onClick={this.onCollapseChange}>
                {caret} {labelNode}
            </button>
        ) : (
            labelNode
        );

        if (link === null && labelPrefix === null && labelSuffix == null) {
            return null;
        }

        const labelContainerClasses = classNames({
            'form-group-label': true,
            'card-header': asCard,
        });

        const labelClasses = classNames({
            'control-label': !asCard,
            'smaller-text': small,
        });

        return (
            <div className={labelContainerClasses}>
                {isMessage(labelPrefix) ? <FormattedMessage {...labelPrefix} /> : labelPrefix}
                {large ? (
                    <h4 className="control-label">{link}</h4>
                ) : (
                    <label htmlFor={name} className={labelClasses}>
                        {link}
                    </label>
                )}
                {isMessage(labelSuffix) ? <FormattedMessage {...labelSuffix} /> : labelSuffix}
            </div>
        );
    }

    render() {
        const {
            inline,
            children,
            className,
            inputOnly,
            asCard,
            collapsible,
            withoutMargin,
            errors,
        } = this.props;
        const { collapsed } = this.state;

        if (inputOnly) {
            return children;
        }

        const customClassNames = className
            ? className.split(' ').reduce(
                  (obj, key) => ({
                      ...obj,
                      [key]: true,
                  }),
                  {},
              )
            : null;
        const formGroupClassNames = classNames({
            'form-group': true,
            'form-group-collapsible': collapsible,
            'has-padding-bottom': inline,
            card: asCard && !inline,
            'card-default': asCard && !inline,
            'mb-0': withoutMargin,
            'has-error': errors !== null && !isEmpty(errors),
            ...customClassNames,
        });

        const formGroupInnerClassNames = classNames({
            'form-group-inner': true,
            'form-group-collapsible-inner': collapsible,
            'card-body': asCard && !inline,
        });

        const innerStyle = {
            display: collapsed ? 'none' : 'block',
        };

        if (inline) {
            return (
                <div className={formGroupClassNames}>
                    <div className="table-full table-form-height">
                        <div className="table-row">
                            <div className="table-cell-centered left">{this.renderLabel()}</div>
                            <div className="table-cell-centered right">
                                <div className={formGroupInnerClassNames} style={innerStyle}>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderErrors()}
                    {this.renderHelp()}
                </div>
            );
        }
        return (
            <div className={formGroupClassNames}>
                {this.renderLabel()}
                {!collapsed ? (
                    <div className={formGroupInnerClassNames} style={innerStyle}>
                        {children}
                        {this.renderErrors()}
                        {this.renderHelp()}
                    </div>
                ) : null}
            </div>
        );
    }
}

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
