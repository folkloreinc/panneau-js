import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { DateTimeField } from '@panneau/fields/datetime';
import { SelectField as Radios } from '@panneau/fields/select';
import { NumberField } from '@panneau/fields/number';
import { Fieldset } from '@panneau/ui';
import { getFieldProps } from '@panneau/fields';

const propTypes = {
    value: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
        repeat: PropTypes.string,
        count: PropTypes.number,
    }),
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    disabled: false,
    onChange: null,
};

function ScheduleField({ value, disabled, onChange }) {
    const { start = null, end = null, repeat = 'never', count = null } = value || {};
    const change = (key) => (newValue) => {
        if (onChange !== null) {
            onChange({ ...value, [key]: newValue });
        }
    };
    // TODO(panneau-5): `<Radios>`: `uncheckable` is not a prop of `SelectField` of `@panneau/fields/select`
    return (
        <div className="row g-3">
            <DateTimeField
                label={<FormattedMessage defaultMessage="Start" />}
                className="col-auto"
                value={start}
                disabled={disabled}
                onChange={change('start')} />
            <DateTimeField
                label={<FormattedMessage defaultMessage="End" />}
                className="col-auto"
                value={end}
                disabled={disabled}
                onChange={change('end')} />
            <Fieldset legend={<FormattedMessage defaultMessage="Repeat" />} className="col-12">
                <Radios
                    name="repeat"
                    value={repeat}
                    options={[
                        { value: 'never', label: 'Never' },
                        { value: 'weekly', label: 'Every week' },
                    ]}
                    uncheckable
                    onChange={change('repeat')}
                    widget="radios" />
                <NumberField value={count} onChange={change('count')} />
            </Fieldset>
        </div>
    );
}

ScheduleField.propTypes = propTypes;
ScheduleField.defaultProps = defaultProps;

/** The registry entry of `ScheduleField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function ScheduleFieldEntry(props) {
    const { label, description, errors, required } = getFieldProps(props);
    return (
        <Fieldset legend={label} description={description} errors={errors} isRequired={required} className={props.className}>
            <ScheduleField
                value={props.value}
                disabled={props.disabled}
                onChange={props.onChange}
            />
        </Fieldset>
    );
}

export default ScheduleField;
