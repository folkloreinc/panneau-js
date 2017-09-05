import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import FormGroup from '../FormGroup';

/**
 *  Class: CodeField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */

const propTypes = {
    language: PropTypes.string,
    theme: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    width: PropTypes.string,
    height: PropTypes.string,
    parseJSON: PropTypes.bool,
    onChange: PropTypes.func,
};

const defaultProps = {
    language: 'javascript',
    theme: 'github',
    name: null,
    label: null,
    value: null,
    width: '100%',
    height: '300px',
    parseJSON: true,
    onChange: null,
};

class CodeField extends Component {
    static parse(value) {
        if (typeof value === 'undefined' || value === null) {
            return value;
        }
        return isString(value) || isNumber(value) ? value : JSON.stringify(value, null, 4);
    }

    constructor(props) {
        super(props);

        this.AceEditor = null;
        this.brace = null;

        this.onChange = this.onChange.bind(this);

        this.state = {
            ready: false,
            textValue: props.language === 'json' && props.parseJSON ? CodeField.parse(props.value) : null,
        };
    }

    componentDidMount() {
        const { language, theme } = this.props;
        import(/* webpackChunkName: "vendor/react-ace" */'react-ace')
            .then((AceEditor) => {
                this.AceEditor = AceEditor.default;
            })
            .then(() => import(/* webpackChunkName: "vendor/brace" */'brace'))
            .then((brace) => {
                this.brace = brace;
            })
            .then(() => import(/* webpackChunkName: "vendor/brace/mode/[request]" */`brace/mode/${language}`))
            .then(() => import(/* webpackChunkName: "vendor/brace/theme/[request]" */`brace/theme/${theme}`))
            .then(() => {
                this.setState({
                    ready: true,
                });
            });
    }

    componentWillUnmount() {

    }

    onChange(newValue) {
        const {
            language,
            onChange,
            parseJSON,
            value,
        } = this.props;

        if (language === 'json' && parseJSON) {
            this.setState({
                textValue: newValue,
            }, () => {
                let val;
                try {
                    val = JSON.parse(newValue);
                } catch (e) {
                    val = value;
                }
                if (onChange) {
                    onChange(val);
                }
            });
        } else if (onChange) {
            onChange(newValue);
        }
    }

    renderField() {
        const {
            language,
            theme,
            value,
            parseJSON,
            ...props
        } = this.props;

        const { textValue } = this.state;

        const val = language === 'json' && parseJSON ? textValue : CodeField.parse(value);

        const AceEditor = this.AceEditor;

        return (
            <AceEditor
                {...props}
                mode={language}
                theme={theme}
                value={val || ''}
                onChange={this.onChange}
            />
        );
    }

    render() {
        const {
            name,
            label,
            ...other
        } = this.props;

        const { ready } = this.state;

        return (
            <FormGroup className="form-group-text" name={name} label={label} {...other} >
                { ready ? this.renderField() : null }
            </FormGroup>
        );
    }
}

CodeField.propTypes = propTypes;
CodeField.defaultProps = defaultProps;

export default CodeField;
