/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@panneau/element-button';

import MediasBrowser from './MediasBrowser';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    multiple: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    onClose: null,
    multiple: false,
    className: null,
};

function MediasPicker({ value, onChange, onConfirm, onClose, multiple, className, ...props }) {
    const onSelectionChange = useCallback(
        (items) => {
            if (onChange !== null) {
                onChange(items);
            }
        },
        [onChange],
    );
    const disabled = value === null || value.length < 1;

    return (
        <div className={className}>
            <MediasBrowser
                tableProps={{ selectable: true, multipleSelection: multiple, onSelectionChange }}
                {...props}
            />
            {multiple ? (
                <div className="d-flex w-100 align-items-end justify-content-end mt-3">
                    {onClose !== null ? (
                        <Button
                            type="button"
                            theme="secondary"
                            onClick={onClose}
                            className="d-block me-2"
                        >
                            <FormattedMessage defaultMessage="Cancel" description="Button label" />
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        theme="primary"
                        onClick={onConfirm}
                        disabled={disabled}
                        outline={disabled}
                        className="d-block"
                    >
                        <FormattedMessage defaultMessage="Confirm" description="Button label" />
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

MediasPicker.propTypes = propTypes;
MediasPicker.defaultProps = defaultProps;

export default MediasPicker;
