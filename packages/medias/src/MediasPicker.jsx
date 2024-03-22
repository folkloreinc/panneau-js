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
    multiple: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    multiple: false,
    className: null,
};

function MediasPicker({ value, onChange, onConfirm, multiple, className, ...props }) {
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
                tableProps={{ selectable: true, multiple, onSelectionChange }}
                {...props}
            />
            {multiple ? (
                <Button
                    className="mt-2"
                    onClick={onConfirm}
                    theme="info"
                    disabled={disabled}
                    outline={disabled}
                >
                    <FormattedMessage defaultMessage="Confirm" description="Button label" />
                </Button>
            ) : null}
        </div>
    );
}

MediasPicker.propTypes = propTypes;
MediasPicker.defaultProps = defaultProps;

export default MediasPicker;
