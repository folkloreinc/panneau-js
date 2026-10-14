import { FormattedMessage } from 'react-intl';

import type { Label as LabelType, MessageValues } from '@panneau/core';
import { isMessage } from '@panneau/core/utils';

interface LabelProps {
    children: LabelType;
    isHtml?: boolean;
    values?: MessageValues;
}

const DEFAULT_VALUES: MessageValues = {};

function Label({ children, isHtml = false, values = DEFAULT_VALUES }: LabelProps) {
    const Message = isHtml ? FormattedMessage : FormattedMessage;
    return isMessage(children) ? <Message values={values} {...children} /> : <>{children}</>;
}

export default Label;
