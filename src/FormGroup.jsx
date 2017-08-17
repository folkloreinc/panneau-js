import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isString from 'lodash/isString';
import ReactMarkdown from 'react-markdown';

const propTypes = {
    children: PropTypes.node,

    className: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    errors: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
    helpText: PropTypes.string,

    large: PropTypes.bool,
    small: PropTypes.bool,
    inline: PropTypes.bool,

    collapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    inputOnly: PropTypes.bool,
};

const defaultProps = {
    children: null,

    className: 'text',
    name: null,
    label: null,
    errors: [],
    helpText: null,

    large: false,
    small: false,
    inline: false,

    collapsible: false,
    collapsed: false,
    inputOnly: false,
};

class FormGroup extends Component {
    constructor(props) {
        super(props);
        this.onCollapseChange = this.onCollapseChange.bind(this);
        this.renderError = this.renderError.bind(this);

        this.state = {
            collapsed: this.props.collapsed,
        };
    }

    componentWillReceiveProps() {

    }

    onCollapseChange(e) {
        e.preventDefault();
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    renderErrors() {
        const { errors } = this.props;
        if (!errors || errors.length < 1) {
            return null;
        }
        const items = isString(errors) ? [errors] : errors;
        return items.map(this.renderError);
    }

    // eslint-disable-next-line class-methods-use-this
    renderError(error, key) {
        if (!error || !error.length) {
            return null;
        }
        const errorKey = `error_${key}`;
        return (
            <span key={errorKey} className="help-block">{error}</span>
        );
    }

    renderHelp() {
        const { helpText } = this.props;
        if (!helpText) {
            return null;
        }
        return (
            <div className="help-block">
                <ReactMarkdown
                    source={helpText}
                    linkTarget="_blank"
                />
            </div>
        );
    }

    renderLabel() {
        const { name, label, large, small, collapsible } = this.props;

        const caret = (
            <span className={this.state.collapsed ? 'dropright' : 'dropdown'}>
                <span className="caret up" />
            </span>
        );

        const link = collapsible ? (
            <button className="no-btn-style no-link" onClick={this.onCollapseChange}>{caret} {label}</button>
        ) : label;

        const labelClasses = classNames({
            'control-label': true,
            'smaller-text': small,
        });

        const renderedLabel = large ?
            <h4 className="control-label">{link}</h4> :
            <label htmlFor={name} className={labelClasses}>{link}</label>;

        return link ? renderedLabel : null;
    }

    render() {
        const {
            inline,
            children,
            className,
            errors,
            inputOnly,
            collapsible,
        } = this.props;

        if (inputOnly) {
            return children;
        }

        const customClassNames = className ? className.split(' ').reduce((obj, key) => ({
            ...obj,
            [key]: true,
        }), {}) : null;
        const formGroupClassNames = classNames({
            'form-group': true,
            'form-group-collapsible': collapsible,
            'has-error': errors && errors.length,
            'has-padding-bottom': inline,
            ...customClassNames,
        });

        const formGroupInnerClassNames = classNames({
            'form-group-inner': true,
            'form-group-collapsible-inner': collapsible,
        });

        const innerStyle = {
            display: this.state.collapsed ? 'none' : 'block',
        };

        if (inline) {
            return (
                <div className={formGroupClassNames}>
                    <div className="table-full table-form-height">
                        <div className="table-row">
                            <div className="table-cell-centered left">
                                { this.renderLabel() }
                            </div>
                            <div className="table-cell-centered right">
                                <div className={formGroupInnerClassNames} style={innerStyle}>
                                    { children }
                                </div>
                            </div>
                        </div>
                    </div>
                    { this.renderHelp() }
                    { this.renderErrors() }
                </div>
            );
        }
        return (
            <div className={formGroupClassNames}>
                { this.renderLabel() }
                { !this.state.collapsed ? (
                    <div className={formGroupInnerClassNames} style={innerStyle}>
                        { children }
                        { this.renderHelp() }
                        { this.renderErrors() }
                    </div>
                ) : null }
            </div>
        );
    }
}

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
