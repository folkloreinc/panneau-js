import { useFieldComponent } from '@panneau/core/contexts';
import FormGroup from '@panneau/element-form-group';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

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
    const DateTimeField = useFieldComponent('date_time');
    const Radios = useFieldComponent('radios');
    const NumberField = useFieldComponent('number');
    const { start = null, end = null, repeat = 'never', count = null } = value || {};
    const change = (key) => (newValue) => {
        if (onChange !== null) {
            onChange({ ...value, [key]: newValue });
        }
    };
    return (
        <div className="row g-3">
            <FormGroup label={<FormattedMessage defaultMessage="Start" />} className="col-auto">
                <DateTimeField value={start} disabled={disabled} onChange={change('start')} />
            </FormGroup>
            <FormGroup label={<FormattedMessage defaultMessage="End" />} className="col-auto">
                <DateTimeField value={end} disabled={disabled} onChange={change('end')} />
            </FormGroup>
            <FormGroup label={<FormattedMessage defaultMessage="Repeat" />} className="col-12">
                <Radios
                    name="repeat"
                    value={repeat}
                    options={[
                        { value: 'never', label: 'Never' },
                        { value: 'weekly', label: 'Every week' },
                    ]}
                    uncheckable
                    onChange={change('repeat')}
                />
                <NumberField value={count} onChange={change('count')} />
            </FormGroup>
        </div>
    );
}

ScheduleField.propTypes = propTypes;
ScheduleField.defaultProps = defaultProps;

export default ScheduleField;
