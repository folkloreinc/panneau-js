import classNames from 'classnames';
import { type ReactNode, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@panneau/element-button';
import Label from '@panneau/element-label';

import styles from './styles.module.css';

interface ImportTemplate {
    columns?: { name?: string }[];
}

interface ImportFieldProps {
    value?: boolean | null;
    name?: string | null;
    format?: string;
    template?: ImportTemplate | null;
    isModal?: boolean;
    icon?: string;
    iconPosition?: string | null;
    label?: string | ReactNode | null;
    disabled?: boolean;
    theme?: string;
    outline?: boolean;
    dark?: boolean;
    primaryColor?: string | null;
    customStyles?: {
        'color-background'?: string;
        'color-background-modal'?: string;
    } | null;
    showDownloadTemplateButton?: boolean;
    skipHeaderRowSelection?: boolean;
    onChange?: ((data: unknown) => void) | null;
    onClose?: (() => void) | null;
    className?: string | null;
}

function ImportField({
    value = null,
    name = null,
    format = 'csv',
    isModal = false,
    icon = 'database',
    iconPosition = null,
    label = null,
    template = null,
    disabled = false,
    theme = 'primary',
    outline = false,
    dark = false,
    primaryColor = null,
    customStyles = null,
    showDownloadTemplateButton = true,
    skipHeaderRowSelection = false,
    onChange = null,
    onClose = null,
    className = null,
}: ImportFieldProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const finalOnClose = useCallback(() => {
        setIsOpen(false);
        if (onClose !== null) {
            onClose();
        }
    }, [onClose]);

    const onComplete = useCallback(
        (data: unknown) => {
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
            {format === 'csv' ? (
                // <CSVImporter
                //     className={styles.importer}
                //     template={template}
                //     isModal={isModal}
                //     modalIsOpen={isOpen}
                //     modalOnCloseTriggered={finalOnClose}
                //     modalCloseOnOutsideClick
                //     darkMode={theme === 'dark' || dark}
                //     primaryColor={primaryColor}
                //     customStyles={customStyles}
                //     onComplete={onComplete}
                //     showDownloadTemplateButton={showDownloadTemplateButton}
                //     skipHeaderRowSelection={skipHeaderRowSelection}
                // />
                <div>Replace deprecated CSVImporter component</div>
            ) : null}
        </div>
    );
}

export default ImportField;
