import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { FormGroup } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { AceEditor, loadBrace } from './vendors';

import styles from './styles.scss';

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
    label: PanneauPropTypes.label,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    extensions: PropTypes.arrayOf(PropTypes.string),
    editorProps: PropTypes.object, // eslint-disable-line
    isJson: PropTypes.bool,
    onChange: PropTypes.func,
};

const defaultProps = {
    language: 'javascript',
    theme: 'github',
    name: null,
    label: null,
    value: null,
    width: '100%',
    height: 300,
    isJson: true,
    extensions: [],
    editorProps: { $blockScrolling: Infinity },
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

        this.brace = null;
        this.importCanceled = false;

        this.onChange = this.onChange.bind(this);

        this.state = {
            ready: false,
            textValue:
                props.language === 'json' && props.isJson ? CodeField.parse(props.value) : null,
        };
    }

    componentDidMount() {
        const { language, theme, extensions } = this.props;
        loadBrace(language, theme, extensions).then(() => {
            if (this.importCanceled) {
                return;
            }
            this.setState({
                ready: true,
            });
        });
    }

    componentWillUnmount() {
        this.importCanceled = true;
    }

    onChange(newValue) {
        const {
            language, onChange, isJson, value,
        } = this.props;

        if (language === 'json' && isJson) {
            this.setState(
                {
                    textValue: newValue,
                },
                () => {
                    let val;
                    try {
                        val = JSON.parse(newValue);
                    } catch (e) {
                        val = value;
                    }
                    if (onChange) {
                        onChange(val);
                    }
                },
            );
        } else if (onChange) {
            onChange(newValue);
        }
    }

    renderField() {
        const {
            language, theme, value, isJson, width, height, editorProps, ...props
        } = this.props;
        const { textValue } = this.state;

        const val = language === 'json' && isJson ? textValue : CodeField.parse(value);

        const editorWidth = isNumber(width) ? `${width}px` : width;
        const editorHeight = isNumber(height) ? `${height}px` : height;

        return (
            <AceEditor
                {...props}
                mode={language}
                theme={theme}
                value={val || ''}
                width={editorWidth}
                height={editorHeight}
                editorProps={editorProps}
                onChange={this.onChange}
            />
        );
    }

    render() {
        const { name, label, ...other } = this.props;

        const { ready } = this.state;

        return (
            <FormGroup
                className={`${styles.formGroup} form-group-code`}
                name={name}
                label={label}
                {...other}
            >
                {ready ? this.renderField() : null}
            </FormGroup>
        );
    }
}

CodeField.propTypes = propTypes;
CodeField.defaultProps = defaultProps;

export default CodeField;
