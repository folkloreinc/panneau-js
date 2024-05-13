/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import { CSVImporter } from 'csv-import-react';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@panneau/element-button';
import Label from '@panneau/element-label';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.bool,
    name: PropTypes.string,
    format: PropTypes.string,
    template: PropTypes.shape({
        columns: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    }),
    isModal: PropTypes.bool,
    icon: PropTypes.string,
    iconPosition: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    disabled: PropTypes.bool,
    theme: PropTypes.string,
    outline: PropTypes.bool,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    name: null,
    format: 'csv',
    template: null,
    isModal: false,
    icon: 'database',
    iconPosition: null,
    label: null,
    disabled: false,
    theme: 'primary',
    outline: false,
    onChange: null,
    onClose: null,
    className: null,
};

const ImportField = ({
    value,
    name,
    isModal,
    icon,
    iconPosition,
    label,
    template,
    disabled,
    theme,
    outline,
    onChange,
    onClose,
    className,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, [onClose]);

    const finalOnClose = useCallback(() => {
        setIsOpen(false);
        if (onClose !== null) {
            onClose();
        }
    }, [onClose]);

    const onComplete = useCallback(
        (data) => {
            if (onChange !== null) {
                onChange(data);
            }
        },
        [onChange],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.withoutModal]: !isModal,
                    [styles.disabled]: disabled && !isModal,
                    [className]: className !== null,
                },
            ])}
        >
            {isModal ? (
                <Button
                    type="button"
                    theme={theme}
                    icon={icon || 'upload'}
                    iconPosition={iconPosition || 'right'}
                    onClick={openModal}
                    disabled={isOpen || disabled}
                    outline={outline}
                >
                    <Label>
                        {label || (
                            <FormattedMessage defaultMessage="Import" description="Button label" />
                        )}
                    </Label>
                </Button>
            ) : null}
            <CSVImporter
                isModal={isModal}
                modalIsOpen={isOpen}
                modalOnCloseTriggered={finalOnClose}
                modalCloseOnOutsideClick
                darkMode={theme === 'dark'}
                onComplete={onComplete}
                // primaryColor
                // customStyles
                // showDownloadTemplateButton
                // skipHeaderRowSelection
                template={template}
                {...props}
            />
        </div>
    );
};

ImportField.propTypes = propTypes;
ImportField.defaultProps = defaultProps;

export default ImportField;
