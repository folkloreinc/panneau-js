import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { withDefinition, PropTypes as PanneauPropTypes } from '@panneau/core';
import { FormGroup, UploadButton } from '@panneau/field';

import messages from './messages';

import styles from './styles.scss';

const propTypes = {
    CardComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    type: PropTypes.string,
    vertical: PropTypes.bool,
    onChange: PropTypes.func,
    uploadEndpoint: PropTypes.string,
    uploadButtonLabel: PanneauPropTypes.message,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    vertical: false,
    onChange: null,
    type: null,
    uploadEndpoint: null,
    uploadButtonLabel: messages.uploadMediaLabel,
};

class MediaField extends Component {
    constructor(props) {
        super(props);

        this.onUploadComplete = this.onUploadComplete.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
    }

    onClickDelete() {
        if (this.props.onChange) {
            this.props.onChange(null);
        }
    }

    onUploadComplete(response) {
        if (this.props.onChange) {
            this.props.onChange(response);
        }
    }

    renderUploadButton() {
        const { uploadButtonLabel, uploadEndpoint } = this.props;
        return (
            <div className={styles.upload}>
                <UploadButton
                    endpoint={uploadEndpoint}
                    label={uploadButtonLabel}
                    onUploadComplete={this.onUploadComplete}
                />
            </div>
        );
    }

    renderCard() {
        const { value, vertical, CardComponent } = this.props;
        return (
            <div className={styles.media}>
                {CardComponent !== null ? (
                    <CardComponent
                        item={value}
                        vertical={vertical}
                        onClickDelete={this.onClickDelete}
                    />
                ) : null}
            </div>
        );
    }

    render() {
        const {
            name,
            value,
            label,
            vertical,
            CardComponent,
            uploadButtonLabel,
            uploadEndpoint,
            ...other
        } = this.props;

        return (
            <FormGroup className={styles.field} name={name} label={label} {...other}>
                {value !== null ? this.renderCard() : this.renderUploadButton()}
            </FormGroup>
        );
    }
}

MediaField.propTypes = propTypes;
MediaField.defaultProps = defaultProps;

const mapDefinitionToProps = definition => ({
    uploadEndpoint: get(definition, 'endpointUploadMedia', '/mediatheque/upload'),
});
export default withDefinition(mapDefinitionToProps)(MediaField);
