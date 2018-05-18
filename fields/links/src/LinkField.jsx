import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { FormGroup } from '@panneau/field';
import TextField from '@panneau/field-text';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles.scss';

const messages = defineMessages({
    urlLabel: {
        id: 'fields.link.url_label',
        description: 'The label of the url field',
        defaultMessage: 'URL',
    },
    labelLabel: {
        id: 'fields.link.label_label',
        description: 'The label of the label field',
        defaultMessage: 'Label',
    },
});

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    urlLabel: PanneauPropTypes.message,
    labelLabel: PanneauPropTypes.message,
    schemes: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.shape({
        url: PropTypes.string,
        label: PropTypes.string,
    }),
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    schemes: ['http://', 'https://', 'ftp://'],
    urlLabel: messages.urlLabel,
    labelLabel: messages.labelLabel,
    value: null,
    onChange: null,
};

class LinkField extends Component {
    static parse(value) {
        return value;
    }

    constructor(props) {
        super(props);

        this.onUrlChange = this.onFieldChange.bind(this, 'url');
        this.onLabelChange = this.onFieldChange.bind(this, 'label');

        this.state = {
            scheme: this.getScheme(props.value),
        };
    }

    componentWillReceiveProps(nextProps) {
        const valueChanged = nextProps.value !== this.props.value;
        if (valueChanged) {
            this.setState({
                scheme: this.getScheme(nextProps.value),
            });
        }
    }

    onFieldChange(key, value) {
        const { value: currentValue, onChange } = this.props;
        const { scheme } = this.state;
        const newValue = {
            ...currentValue,
            [key]: key === 'url' && value !== null && value.length > 0 ? this.withScheme(value, scheme) : value,
        };
        if (onChange !== null) {
            onChange(newValue);
        }
    }

    getSchemesPattern() {
        const { schemes } = this.props;
        return new RegExp(`^(${schemes.join('|')})`, 'i');
    }

    getScheme(value) {
        const { schemes } = this.props;
        const schemesPattern = this.getSchemesPattern();
        const urlValue = value !== null ? value.url || null : null;
        const match = urlValue !== null ? urlValue.match(schemesPattern) : null;
        return match !== null && match[1].length !== urlValue.length
            ? match[1].toLowerCase()
            : schemes[0];
    }

    withScheme(value, prefix) {
        const schemesPattern = this.getSchemesPattern();
        return value !== null && !value.match(schemesPattern) ? `${prefix}${value}` : value;
    }

    render() {
        const {
            label, urlLabel, labelLabel, name, value, ...other
        } = this.props;
        const { scheme } = this.state;

        const urlValue = value !== null ? value.url || null : null;
        const labelValue = value !== null ? value.label || null : null;
        const schemesPattern = this.getSchemesPattern();
        const url = urlValue !== null ? urlValue.replace(schemesPattern, '') : null;

        return (
            <FormGroup className={styles.container} name={name} label={label} {...other}>
                <div className="row">
                    <div className="col-sm-8">
                        <TextField
                            prefix={scheme}
                            value={url}
                            label={urlLabel}
                            onChange={this.onUrlChange}
                        />
                    </div>
                    <div className="col-sm-4">
                        <TextField
                            value={labelValue}
                            label={labelLabel}
                            onChange={this.onLabelChange}
                        />
                    </div>
                </div>
            </FormGroup>
        );
    }
}

LinkField.propTypes = propTypes;
LinkField.defaultProps = defaultProps;

export default LinkField;
