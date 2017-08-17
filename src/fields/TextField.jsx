import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import FormGroup from '../FormGroup';

/**
 *  Class: TextField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */
const propTypes = {
    type: PropTypes.oneOf(
        ['text', 'email', 'password', 'url', 'number', 'textarea', 'editor'],
    ),
    name: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    onChange: PropTypes.func,

    prefix: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    suffix: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    disabled: PropTypes.bool,
    ckeditorCustomConfig: PropTypes.object,
};

const defaultProps = {
    type: 'text',
    name: null,
    label: null,
    placeholder: null,
    value: null,
    onChange: null,

    prefix: null,
    suffix: null,
    disabled: false,
    ckeditorCustomConfig: {},
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

        this.editor = null;
        this.ckeditor = null;
    }

    componentDidMount() {
        const { type } = this.props;
        if (type === 'editor') {
            import(/* webpackChunkName: "vendor/ckeditor" */ 'ckeditor')
                .then(() => {
                    this.ckeditor = CKEDITOR; // eslint-disable-line no-undef
                    const editor = this.ckeditor.replace('editor');
                    if (this.props.ckeditorCustomConfig) {
                        editor.config = this.props.ckeditorCustomConfig;
                    }
                    editor.on('instanceReady', this.onEditorReady);
                    editor.on('change', this.onEditorChange);
                });
        }
    }

    componentWillUnmount() {
        const { type } = this.props;
        if (type === 'editor') {
            this.ckeditor.remove(this.editor);
        }
    }

    onEditorReady(e) {
        e.editor.setData(this.props.value);
    }

    onChange(e) {
        const newValue = e.target.value;
        if (this.props.onChange && isString(newValue) && this.props.value !== newValue) {
            this.props.onChange(newValue);
        }
    }

    onEditorChange(e) {
        const newValue = e.editor.getData();
        if (this.props.onChange && isString(newValue) && this.props.value !== newValue) {
            this.props.onChange(newValue);
        }
    }

    render() {
        const {
            type,
            name,
            label,
            placeholder,
            value,
            prefix,
            suffix,
            disabled,
            ...other
        } = this.props;

        const defaultValue = TextField.parse(value);

        let field = null;
        if (type === 'textarea') {
            field = <textarea className="field-textarea form-control" name={name} value={defaultValue} onChange={this.onChange} disabled={disabled} />;
        } else if (type === 'editor') {
            field = (
                <div className="editor" {...other}>
                    <textarea id="editor" className="field-editor" name="editor" ref={(el) => { this.editor = el; }} />
                    <input type="hidden" name={name} value={defaultValue} />
                </div>
            );
        } else {
            field = (
                <input
                    id={name}
                    type={type}
                    className="field-text form-control"
                    name={name}
                    value={defaultValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={this.onChange}
                />
            );
        }

        let inputGroup = null;
        if (prefix || suffix) {
            const fixClassNames = classNames({
                'input-group-addon': isString(suffix),
                'input-group-addon input-group-addon-small': !isString(suffix),
            });

            const renderedPrefix = prefix ?
                <span className={fixClassNames}>{prefix}</span> : null;

            const renderedSuffix = suffix ?
                <span className={fixClassNames}>{suffix}</span> : null;

            const groupClassNames = classNames({
                'input-group': true,
                'input-group-text': true,
                [`input-group-${type}`]: true,
            });

            inputGroup = (
                <div className={groupClassNames}>
                    { renderedPrefix }
                    { field }
                    { renderedSuffix }
                </div>
            );
        } else {
            inputGroup = field;
        }

        return (
            <FormGroup className="form-group-text" name={name} label={label} {...other} >
                { inputGroup }
            </FormGroup>
        );
    }
}

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;
