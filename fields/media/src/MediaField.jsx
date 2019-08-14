/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDefinition } from '@panneau/core/contexts';
import { FormGroup, UploadButton } from '@panneau/field';

import messages from './messages';

import styles from './styles.scss';

const propTypes = {
    CardComponent: PropTypes.elementType.isRequired,
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    type: PropTypes.string,
    cardVertical: PropTypes.bool,
    cardWithoutBorder: PropTypes.bool,
    onChange: PropTypes.func,
    uploadEndpoint: PropTypes.string,
    uploadButtonLabel: PanneauPropTypes.message,
    uploadAccept: PropTypes.string,
    onClickDelete: PropTypes.func,
    onUploadComplete: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    cardVertical: false,
    cardWithoutBorder: false,
    onChange: null,
    type: null,
    uploadEndpoint: null,
    uploadButtonLabel: messages.uploadMediaLabel,
    uploadAccept: null,
    onClickDelete: null,
    onUploadComplete: null,
};

const MediaField = ({
    name,
    value,
    label,
    type,
    cardVertical,
    cardWithoutBorder,
    CardComponent,
    uploadButtonLabel,
    uploadEndpoint,
    uploadAccept,
    onClickDelete,
    onUploadComplete,
    ...props
}) => {
    const definition = useDefinition();
    const definitionUploadEndpoint = definition.apiUploadEndpoint();
    return (
        <FormGroup className={styles.field} name={name} label={label} {...props}>
            {value !== null ? (
                <div className={styles.media}>
                    {CardComponent !== null ? (
                        <CardComponent
                            vertical={cardVertical}
                            withoutBorder={cardWithoutBorder}
                            {...props}
                            item={value}
                            onClickDelete={onClickDelete}
                        />
                    ) : null}
                </div>
            ) : (
                <div className={styles.upload}>
                    <UploadButton
                        endpoint={uploadEndpoint || definitionUploadEndpoint}
                        label={uploadButtonLabel}
                        accept={uploadAccept || `${type || '*'}/*`}
                        onUploadComplete={onUploadComplete}
                    />
                </div>
            )}
        </FormGroup>
    );
};

MediaField.propTypes = propTypes;
MediaField.defaultProps = defaultProps;

export default MediaField;
