import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { FormGroup } from '@panneau/field';
import TextField from '@panneau/field-text';
import UrlField from '@panneau/field-url';
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
    schemes: undefined,
    urlLabel: messages.urlLabel,
    labelLabel: messages.labelLabel,
    value: null,
    onChange: null,
};

class LinkField extends Component {
    constructor(props) {
        super(props);

        this.onUrlChange = this.onFieldChange.bind(this, 'url');
        this.onLabelChange = this.onFieldChange.bind(this, 'label');
    }

    onFieldChange(key, value) {
        const { value: currentValue, onChange } = this.props;
        const newValue = {
            ...currentValue,
            [key]: value,
        };
        if (onChange !== null) {
            onChange(newValue);
        }
    }

    render() {
        const {
            label, urlLabel, labelLabel, name, value, schemes, ...other
        } = this.props;

        const urlValue = value !== null ? value.url || null : null;
        const labelValue = value !== null ? value.label || null : null;

        return (
            <FormGroup className={styles.container} name={name} label={label} {...other}>
                <div className="row">
                    <div className="col-sm-8">
                        <UrlField
                            value={urlValue}
                            label={urlLabel}
                            schemes={schemes}
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
