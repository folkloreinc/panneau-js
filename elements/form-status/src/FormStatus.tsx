import { faCheckCircle, faSpinner, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import type { FormStatus as FormStatusType, Label } from '@panneau/core';
import LabelComponent from '@panneau/element-label';

interface FormStatusProps {
    status?: FormStatusType;
    successLabel?: Label | null;
    errorLabel?: Label | null;
    loadingLabel?: Label | null;
    className?: string | null;
}

function FormStatus({
    status = null,
    successLabel = null,
    errorLabel = null,
    loadingLabel = null,
    className = null,
}: FormStatusProps) {
    let label: Label | null = null;
    if (status === 'success') {
        label = successLabel || (
            <FormattedMessage defaultMessage="Success!" description="Form status" />
        );
    } else if (status === 'error') {
        label = errorLabel || <FormattedMessage defaultMessage="Error" description="Form status" />;
    } else if (status === 'loading') {
        label = loadingLabel || (
            <FormattedMessage defaultMessage="Loading..." description="Form status" />
        );
    }

    let icon = null;
    if (status === 'success') {
        icon = faCheckCircle;
    } else if (status === 'error') {
        icon = faTimesCircle;
    } else if (status === 'loading') {
        icon = faSpinner;
    }

    return (
        <div
            className={classNames([
                'd-flex',
                'align-items-center',
                {
                    [`text-danger`]: status === 'error',
                    [`text-success`]: status === 'success',
                    [`text-muted`]: status === 'loading',
                },
                className,
            ])}
        >
            {icon !== null ? (
                <FontAwesomeIcon
                    icon={icon}
                    className={classNames([
                        'me-2',
                        {
                            'fa-spin': status === 'loading',
                        },
                    ])}
                />
            ) : null}
            <LabelComponent>{label}</LabelComponent>
        </div>
    );
}

export default FormStatus;
