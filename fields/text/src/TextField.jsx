import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import FormGroup from '@panneau/form-group';

/**
 *  Class: TextField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */
const propTypes = {
    type: PropTypes.oneOf([
        'text', 'email', 'password', 'url', 'number', 'textarea', 'editor',
    ]),
    name: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,

    prefix: PropTypes.node,
    suffix: PropTypes.node,
    prefixClassName: PropTypes.string,
    suffixClassName: PropTypes.string,
    align: PropTypes.oneOf([
        'left', 'right', 'center',
    ]),
    inputOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    ckeditorConfig: PropTypes.object, // eslint-disable-line
    ckeditorCustomConfig: PropTypes.string,
    ckeditorBasePath: PropTypes.string,
};

const defaultProps = {
    type: 'text',
    name: null,
    label: null,
    placeholder: null,
    value: null,
    onChange: null,
    onFocus: null,
    onBlur: null,

    prefix: null,
    suffix: null,
    prefixClassName: null,
    suffixClassName: null,
    align: null,
    inputOnly: false,
    disabled: false,
    ckeditorConfig: null,
    ckeditorCustomConfig: null,
    ckeditorBasePath: 'https://cdn.ckeditor.com/4.7.2/standard/',
};

class TextField extends Component {
    static parse(value) {
        if (isString(value) || isNumber(value)) {
            return value;
        } else if (isArray(value)) {
            return value.join(' ');
        }
        return ''; // Empty string for the input field
    }

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onEditorReady = this.onEditorReady.bind(this);
        this.onEditorChange = this.onEditorChange.bind(this);

        this.importCanceled = false;
        this.ckeditor = null;
        this.editor = null;
        this.refInput = null;
        this.refInputGroup = null;
    }

    componentDidMount() {
        const { type, ckeditorBasePath } = this.props;
        if (type === 'editor') {
            window.CKEDITOR_BASEPATH = ckeditorBasePath;
            import(/* webpackChunkName: "vendor/ckeditor" */ 'ckeditor')
                .then(() => {
                    if (this.importCanceled) {
                        return;
                    }
                    const { ckeditorConfig, ckeditorCustomConfig } = this.props;
                    this.ckeditor = CKEDITOR; // eslint-disable-line no-undef
                    const editor = this.ckeditor.replace(this.editor, {
                        customConfig: ckeditorCustomConfig,
                        ...ckeditorConfig || {},
                    });
                    editor.on('instanceReady', this.onEditorReady);
                    editor.on('change', this.onEditorChange);
                });
        }
    }

    componentWillUnmount() {
        const { type } = this.props;
        this.importCanceled = true;
        if (type === 'editor') {
            this.ckeditor.remove(this.editor);
        }
    }

    onEditorReady(e) {
        e.editor.setData(this.props.value);
    }

    onChange(e) {
        const newValue = (e.currentTarget || this.refInput).value;
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    onEditorChange(e) {
        const newValue = e.editor.getData();
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    getInputRef() {
        return this.refInput;
    }

    getInputGroupRef() {
        return this.refInputGroup;
    }

    renderInput() {
        const {
            type,
            name,
            placeholder,
            value,
            align,
            disabled,
            onFocus,
            onBlur,
        } = this.props;
        const inputValue = TextField.parse(value);

        const inputClassNames = classNames({
            'form-control': true,
            [`field-${type}`]: true,
            [`text-${align}`]: align !== null,
        });

        const inputProps = {
            ref: (ref) => { this.refInput = ref; },
            value: inputValue,
            name,
            id: name,
            placeholder,
            disabled,
            className: inputClassNames,
            onChange: this.onChange,
            onFocus,
            onBlur,
        };

        let input = null;
        if (type === 'textarea') {
            input = (
                <textarea
                    {...inputProps}
                />
            );
        } else if (type === 'editor') {
            input = (
                <div className="editor">
                    <textarea
                        className="field-editor"
                        name="editor"
                        ref={(el) => { this.editor = el; }}
                    />
                    <input
                        type="hidden"
                        name={name}
                        value={inputValue}
                    />
                </div>
            );
        } else {
            input = (
                <input
                    {...inputProps}
                    type={type}
                />
            );
        }
        return input;
    }

    renderInputGroup(input) {
        const {
            type,
            prefix,
            suffix,
            prefixClassName,
            suffixClassName,
        } = this.props;

        const prefixClassNames = classNames({
            'input-group-addon': prefixClassName === null && isString(prefix),
            'input-group-addon input-group-addon-small': prefixClassName === null && !isString(prefix),
            [prefixClassName]: prefixClassName !== null,
        });

        const suffixClassNames = classNames({
            'input-group-addon': suffixClassName === null && isString(suffix),
            'input-group-addon input-group-addon-small': suffixClassName === null && !isString(suffix),
            [suffixClassName]: suffixClassName !== null,
        });

        const renderedPrefix = prefix ?
            <span className={prefixClassNames}>{prefix}</span> : null;

        const renderedSuffix = suffix ?
            <span className={suffixClassNames}>{suffix}</span> : null;

        const groupClassNames = classNames({
            'input-group': true,
            'input-group-text': true,
            [`input-group-${type}`]: true,
        });

        return (
            <div
                className={groupClassNames}
                ref={(ref) => { this.refInputGroup = ref; }}
            >
                { renderedPrefix }
                { input }
                { renderedSuffix }
            </div>
        );
    }

    render() {
        const {
            label,
            name,
            prefix,
            suffix,
            ...other
        } = this.props;
        const input = this.renderInput();
        const inputGroup = prefix || suffix ? this.renderInputGroup(input) : input;
        return (
            <FormGroup
                className="form-group-text"
                name={name}
                label={label}
                {...other}
            >
                { inputGroup }
            </FormGroup>
        );
    }
}

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;
