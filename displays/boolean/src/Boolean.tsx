import { FormattedMessage } from 'react-intl';

import Icon from '@panneau/element-icon';

interface BooleanProps {
    value?: string | number | boolean | null;
    labelTrue?: string | null;
    labelFalse?: string | null;
    iconTrue?: string | null;
    iconFalse?: string | null;
}

function Boolean({
    value = null,
    iconTrue = null,
    iconFalse = null,
    labelTrue = null,
    labelFalse = null,
}: BooleanProps) {
    return value === true || value === 'true' || value === 1 || value === '1' ? (
        <span className="badge bg-success">
            {iconTrue !== null ? (
                <Icon name={iconTrue} />
            ) : (
                labelTrue || <FormattedMessage defaultMessage="Yes" description="Boolean value" />
            )}
        </span>
    ) : (
        <span className="badge bg-warning">
            {iconFalse !== null ? (
                <Icon name={iconFalse} />
            ) : (
                labelFalse || <FormattedMessage defaultMessage="No" description="Boolean value" />
            )}
        </span>
    );
}

export default Boolean;
