import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import 'react-dates/initialize';
import { FormGroup } from '@panneau/field';
import TextField from '@panneau/field-text';
import Popover from '@panneau/modal-popover';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import styles from './styles.scss';
import './vendor.global.scss';

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    startLabel: PropTypes.string,
    endLabel: PropTypes.string,
    startPlaceholder: PropTypes.string,
    endPlaceholder: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            start: PropTypes.string,
            end: PropTypes.string,
        }),
    ]),
    type: PropTypes.oneOf(['date', 'daterange']),
    dateFormat: PropTypes.string,
    pickerProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
};

const defaultProps = {
    name: 'name',
    label: 'label',
    startLabel: 'Start date',
    endLabel: 'End date',
    startPlaceholder: null,
    endPlaceholder: null,
    placeholder: null,
    value: null,
    type: 'date',
    dateFormat: 'YYYY-MM-DD',
    pickerProps: null,
    onChange: null,
};

const getMomentOrNull = (moment, str) => {
    if (str !== null && str !== '') {
        return null;
    }
    const date = moment(str);
    if (!date.isValid()) {
        return null;
    }
    return date;
};

const getDateFormatted = (moment, str, format) => {
    const date = getMomentOrNull(moment, str);
    return date !== null ? date.format(format) : null;
};

class DateField extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onRangeChange = this.onRangeChange.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onInputRangeChange = this.onInputRangeChange.bind(this);
        this.onFocusChange = this.onFocusChange.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputRangeFocus = this.onInputRangeFocus.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onClose = this.onClose.bind(this);
        this.Component = null;
        this.moment = null;
        this.input = null;
        this.startInput = null;
        this.endInput = null;
        this.refContainer = null;

        this.state = {
            ready: false,
            opened: false,
            focusedInput: 'startDate',
            momentValue: null,
            textValue: null,
        };
    }

    componentDidMount() {
        const { type, value } = this.props;
        let componentName;
        if (type === 'daterange') {
            componentName = 'DayPickerRangeController';
        } else {
            componentName = 'DayPickerSingleDateController';
        }
        import(/* webpackChunkName: "vendor/react-dates/[request]" */ `react-dates/lib/components/${componentName}`)
            .then((dep) => {
                this.Component = dep.default;
                return import(/* webpackChunkName: "vendor/moment" */ 'moment');
            })
            .then((dep) => {
                this.moment = dep.default || dep;
                this.setState({
                    ready: true,
                    momentValue:
                        type === 'daterange'
                            ? {
                                start: isObject(value)
                                    ? getMomentOrNull(this.moment, value.start)
                                    : this.moment(),
                                end: isObject(value)
                                    ? getMomentOrNull(this.moment, value.end)
                                    : this.moment(),
                            }
                            : getMomentOrNull(this.moment, value),
                });
            });
    }

    onChange(value) {
        const { dateFormat, onChange } = this.props;
        const textValue = isObject(value) ? value.format(dateFormat) : null;
        this.setState(
            {
                textValue,
                momentValue: value,
            },
            () => {
                if (onChange !== null) {
                    onChange(textValue);
                }
            },
        );
    }

    onRangeChange({ startDate, endDate }) {
        const { dateFormat, onChange } = this.props;
        const { momentValue } = this.state;
        const newMomentValue = {
            start: typeof startDate === 'undefined' ? momentValue.start : startDate,
            end: typeof endDate === 'undefined' ? momentValue.end : endDate,
        };
        const textValue = {
            start:
                isObject(newMomentValue.start) && newMomentValue.start.isValid()
                    ? newMomentValue.start.format(dateFormat)
                    : null,
            end:
                isObject(newMomentValue.end) && newMomentValue.end.isValid()
                    ? newMomentValue.end.format(dateFormat)
                    : null,
        };
        this.setState(
            {
                textValue,
                momentValue: newMomentValue,
            },
            () => {
                if (onChange !== null) {
                    onChange(textValue);
                }
            },
        );
    }

    onInputChange(val) {
        const { dateFormat, onChange } = this.props;
        const newValue = getDateFormatted(this.moment, val, dateFormat);
        this.setState(
            {
                textValue: val,
                momentValue: newValue,
            },
            () => {
                if (onChange !== null) {
                    onChange(newValue);
                }
            },
        );
    }

    onInputRangeChange(key, val) {
        const { value, dateFormat, onChange } = this.props;
        const { textValue, momentValue } = this.state;
        const dateValue = val !== null && val !== '' ? this.moment(val) : null;
        const newTextValue = {
            ...textValue,
            [key]: val,
        };
        const newMomentValue = {
            ...momentValue,
            [key]: dateValue !== null && dateValue.isValid() ? dateValue : null,
        };
        this.setState(
            {
                textValue: newTextValue,
                momentValue: newMomentValue,
            },
            () => {
                const newValue = {
                    ...value,
                    [key]:
                        isObject(newMomentValue) && newMomentValue[key] !== null
                            ? newMomentValue[key].format(dateFormat)
                            : null,
                };
                if (onChange !== null) {
                    onChange(newValue);
                }
            },
        );
    }

    onFocusChange(input) {
        this.setState({
            focusedInput: !input ? 'startDate' : input,
        });
    }

    onInputFocus() {
        this.setState({
            opened: true,
        });
    }

    onButtonClick() {
        this.setState(state => ({
            opened: !state.opened,
        }));
    }

    onInputRangeFocus(key) {
        this.setState({
            opened: true,
            focusedInput: `${key}Date`,
        });
    }

    onClose(e) {
        if (
            (this.input !== null && e.target === this.input.getInputGroupRef())
            || (this.startInput !== null && e.target === this.startInput.getInputGroupRef())
            || (this.endInput !== null && e.target === this.endInput.getInputGroupRef())
        ) {
            return;
        }
        this.setState({
            opened: false,
            focusedInput: null,
        });
    }

    renderInput() {
        const {
            type,
            startLabel,
            endLabel,
            startPlaceholder,
            endPlaceholder,
            placeholder,
        } = this.props;

        const { textValue } = this.state;

        if (type === 'daterange') {
            const startValue = isObject(textValue) ? textValue.start || null : null;
            const endValue = isObject(textValue) ? textValue.end || null : null;
            const onStartChange = val => this.onInputRangeChange('start', val);
            const onEndChange = val => this.onInputRangeChange('end', val);
            const onStartFocus = e => this.onInputRangeFocus('start', e);
            const onEndFocus = e => this.onInputRangeFocus('end', e);
            const onStartClickInputButton = e => this.onInputRangeFocus('start', e);
            const onEndClickInputButton = e => this.onInputRangeFocus('end', e);

            const startSuffix = (
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onStartClickInputButton}
                >
                    <span className="fas fa-calendar" />
                </button>
            );

            const endSuffix = (
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onEndClickInputButton}
                >
                    <span className="fas fa-calendar" />
                </button>
            );

            return (
                <div className={styles.input}>
                    <div className="row">
                        <div className="col-sm-6">
                            <TextField
                                ref={(ref) => {
                                    this.startInput = ref;
                                }}
                                label={startLabel}
                                placeholder={startPlaceholder}
                                value={startValue}
                                onChange={onStartChange}
                                onFocus={onStartFocus}
                                suffix={startSuffix}
                                clearable
                            />
                        </div>
                        <div className="col-sm-6">
                            <TextField
                                ref={(ref) => {
                                    this.endInput = ref;
                                }}
                                label={endLabel}
                                placeholder={endPlaceholder}
                                value={endValue}
                                onChange={onEndChange}
                                onFocus={onEndFocus}
                                suffix={endSuffix}
                                clearable
                            />
                        </div>
                    </div>
                </div>
            );
        }

        const suffix = (
            <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={this.onButtonClick}
            >
                <span className="fas fa-calendar" />
            </button>
        );

        return (
            <div className={styles.input}>
                <TextField
                    ref={(ref) => {
                        this.input = ref;
                    }}
                    value={textValue}
                    placeholder={placeholder}
                    onChange={this.onInputChange}
                    onFocus={this.onInputFocus}
                    suffix={suffix}
                    clearable
                    inputOnly
                />
            </div>
        );
    }

    renderPopover() {
        const { type, pickerProps: customPickerProps } = this.props;
        const { momentValue, focusedInput, opened } = this.state;

        const DateComponent = this.Component;

        const pickerProps = type === 'daterange'
            ? {
                startDate: momentValue.start || undefined,
                endDate: momentValue.end || undefined,
                onDatesChange: this.onRangeChange,
                focusedInput,
                numberOfMonths: 2,
                onFocusChange: this.onFocusChange,
            }
            : {
                date: momentValue || undefined,
                onDateChange: this.onChange,
                autoFocus: false,
                showInput: false,
                focused: true,
                isFocused: opened,
                keepOpenOnDateSelect: true,
            };

        return (
            <Popover
                className={styles.popover}
                element={this.refContainer}
                blurElement={this.refContainer}
                visible={opened}
                onClose={this.onClose}
                closeOnBlur
                noUi
            >
                <DateComponent {...pickerProps} {...customPickerProps} />
            </Popover>
        );
    }

    render() {
        const {
            name, label, value, type, onChange, dateFormat, ...other
        } = this.props;
        const { ready, opened } = this.state;

        if (!ready) {
            return null;
        }

        return (
            <FormGroup {...other} className={styles.container} name={name} label={label}>
                <div
                    className={styles.inner}
                    ref={(ref) => {
                        this.refContainer = ref;
                    }}
                >
                    {this.renderInput()}
                    {opened ? this.renderPopover() : true}
                </div>
            </FormGroup>
        );
    }
}

DateField.propTypes = propTypes;
DateField.defaultProps = defaultProps;

export default DateField;
