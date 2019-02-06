import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes, ErrorsComponent as Errors } from '@panneau/core';
import { FieldsGroup } from '@panneau/field';
import { PropTypes as FormPropTypes, FormActions, messages } from '@panneau/form';

import styles from './styles.scss';

const propTypes = {
    action: PropTypes.string,
    method: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.object),
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: FormPropTypes.errors,
    generalErrorMessage: PropTypes.string,
    buttons: PanneauPropTypes.buttons,
    submitForm: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onErrors: PropTypes.func,
    onComplete: PropTypes.func,
    readOnly: PropTypes.bool,
    notice: FormPropTypes.notice,
};

const defaultProps = {
    action: '',
    method: 'POST',
    buttons: [
        {
            id: 'submit',
            type: 'submit',
            label: messages.save,
            className: 'btn-primary',
        },
    ],
    fields: [],
    value: null,
    errors: null,
    notice: null,
    submitForm: null,
    onChange: null,
    onSubmit: null,
    onErrors: null,
    onComplete: null,
};

const childContextTypes = {
    form: FormPropTypes.form,
};

const contextTypes = {
    form: FormPropTypes.form,
};

class <%= componentName %> extends Component {
    static getDerivedStateFromProps(props, state) {
        const isValueControlled = props.onChange !== null;
        const isErrorsControlled = props.onErrors !== null;
        const valueChanged = isValueControlled && props.value !== state.value;
        const errorsChanged = isErrorsControlled && props.errors !== state.errors;
        if (valueChanged || errorsChanged) {
            return {
                value: valueChanged ? props.value : state.value,
                errors: errorsChanged ? props.errors : state.errors,
            };
        }
        return null;
    }

    constructor(props) {
        super(props);

        this.onFieldsChange = this.onFieldsChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onFormSubmitComplete = this.onFormSubmitComplete.bind(this);
        this.onFormSubmitError = this.onFormSubmitError.bind(this);

        this.refForm = React.createRef();

        this.state = {
            value: props.value,
            errors: props.errors,
        };
    }

    getChildContext() {
        const { value, errors } = this.state;
        const { form = null } = this.context;
        return {
            form: form !== null ? form : {
                errors,
                value,
            },
        };
    }

    onFieldsChange(value) {
        this.setValue(value);
    }

    onFormSubmit(e) {
        const { onSubmit } = this.props;
        const { value } = this.state;
        if (onSubmit !== null) {
            onSubmit(e, value);
        } else {
            e.preventDefault();
            this.submit();
        }
    }

    onFormSubmitComplete(data) {
        const { onComplete } = this.props;
        if (onComplete !== null) {
            onComplete(data);
        }
    }

    onFormSubmitError(error) {
        const { generalErrorMessage } = this.props;
        if (error.name === 'ValidationError') {
            this.setErrors(error.responseData);
        } else {
            this.setErrors(generalErrorMessage);
        }
    }

    /**
     * Set the errors
     *
     * @param {object} errors
     * @public
     */
    setErrors(errors) {
        const { onErrors } = this.props;
        if (onErrors !== null) {
            onErrors(errors);
        } else {
            this.setState({
                errors,
            });
        }
    }

    /**
     * Set the value
     *
     * @param {object} value
     * @public
     */
    setValue(value) {
        const { onChange } = this.props;
        if (onChange !== null) {
            onChange(value);
        } else {
            this.setState({
                value,
            });
        }
    }

    /**
     * Submit the form
     *
     * @public
     */
    submit() {
        const { submitForm } = this.props;
        const { value } = this.state;
        if (submitForm !== null) {
            submitForm(value)
                .then(this.onFormSubmitComplete)
                .catch(this.onFormSubmitError);
        } else {
            this.refForm.current.submit();
        }
    }

    render() {
        const {
            action, method, fields, readOnly, notice, buttons,
        } = this.props;
        const { value, errors } = this.state;

        const errorsIsGeneral = errors !== null && !isObject(errors);

        return (
            <div className={styles.container}>
                <form
                    action={action}
                    method={method}
                    onSubmit={this.onFormSubmit}
                    className={styles.form}
                    ref={this.refForm}
                >
                    {errorsIsGeneral ? (
                        <Errors className={styles.errors} errors={errors} />
                    ) : null}

                    <div className={styles.fields}>
                        <FieldsGroup
                            readOnly={readOnly}
                            fields={fields}
                            value={value}
                            errors={!errorsIsGeneral ? errors : null}
                            onChange={this.onFieldsChange}
                        />
                    </div>

                    <FormActions
                        notice={notice}
                        buttons={buttons}
                        className={classNames(['mt-4', 'border-top', 'pt-2', styles.actions])}
                    />
                </form>
            </div>
        );
    }
}

<%= componentName %>.propTypes = propTypes;
<%= componentName %>.defaultProps = defaultProps;
<%= componentName %>.childContextTypes = childContextTypes;
<%= componentName %>.contextTypes = childContextTypes;

export default <%= componentName %>;
