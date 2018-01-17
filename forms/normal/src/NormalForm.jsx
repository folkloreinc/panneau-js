import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FieldsGroup } from '@panneau/fields';

import styles from './styles.scss';

const propTypes = {
    action: PropTypes.string,
    method: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.object),
    value: PropTypes.shape({}),
    errors: PropTypes.objectOf(PropTypes.array),
    generalError: PropTypes.string,
    generalErrorDefaultMessage: PropTypes.string,
    buttons: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        className: PropTypes.string,
        onClick: PropTypes.func,
    })),
    submitForm: PropTypes.func,
    onValueChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onErrors: PropTypes.func,
    onComplete: PropTypes.func,
};

const defaultProps = {
    action: '',
    method: 'POST',
    buttons: [
        {
            id: 'submit',
            type: 'submit',
            label: 'OK',
            className: classNames({
                'btn-primary': true,
            }),
        },
    ],
    fields: [],
    value: null,
    errors: null,
    generalError: null,
    generalErrorDefaultMessage: 'Sorry, an error occured.',
    submitForm: null,
    onValueChange: null,
    onSubmit: null,
    onErrors: null,
    onComplete: null,
};

class NormalForm extends Component {
    constructor(props) {
        super(props);

        this.onFieldsValueChange = this.onFieldsValueChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onFormSubmitComplete = this.onFormSubmitComplete.bind(this);
        this.onFormSubmitError = this.onFormSubmitError.bind(this);

        this.state = {
            value: props.value,
            errors: props.errors,
            generalError: props.generalError,
        };
    }

    componentWillReceiveProps(nextProps) {
        const valueChanged = nextProps.value !== this.props.value;
        if (valueChanged) {
            this.setState({
                value: nextProps.value,
            });
        }

        const errorsChanged = nextProps.errors !== this.props.errors;
        if (errorsChanged) {
            this.setState({
                errors: nextProps.errors,
            });
        }
    }

    onFieldsValueChange(value) {
        const { onValueChange } = this.props;
        if (onValueChange !== null) {
            onValueChange(value);
        } else {
            this.setState({
                value,
            });
        }
    }

    onFormSubmit(e) {
        const { onSubmit, submitForm } = this.props;
        const { value } = this.state;

        if (onSubmit !== null) {
            onSubmit(e, value);
        }

        if (submitForm !== null) {
            e.preventDefault();
            submitForm(value)
                .then(this.onFormSubmitComplete)
                .catch(this.onFormSubmitError);
        }
    }

    onFormSubmitComplete(data) {
        const { onComplete } = this.props;
        if (onComplete !== null) {
            onComplete(data);
        }
    }

    onFormSubmitError(error) {
        const { onErrors, generalErrorDefaultMessage } = this.props;

        if (onErrors !== null) {
            onErrors(error);
        }

        if (error.name === 'ValidationError') {
            this.setState({
                errors: error.responseData,
            });
        } else {
            // @TODO
            this.setState({
                generalError: generalErrorDefaultMessage,
            });
        }
    }

    renderFields() {
        const { fields } = this.props;
        const { value, errors } = this.state;
        return (
            <FieldsGroup
                fields={fields}
                value={value}
                errors={errors}
                onChange={this.onFieldsValueChange}
            />
        );
    }

    renderActions() {
        const { buttons } = this.props;
        return (
            <div className={styles.buttons}>
                { buttons.map(({
                    id,
                    label,
                    type,
                    className,
                    onClick,
                }) => (
                    <button
                        key={`actions-button-${id}`}
                        type={type}
                        className={classNames({
                            btn: true,
                            [className]: (className || null) !== null,
                            [styles.button]: true,
                            [styles[type]]: true,
                        })}
                        onClick={onClick || null}
                    >
                        { label }
                    </button>
                )) }

            </div>
        );
    }

    render() {
        const {
            action,
            method,
        } = this.props;

        const containerClassNames = classNames({
            [styles.container]: true,
        });

        const formClassNames = classNames({
            [styles.form]: true,
        });

        const fieldsClassNames = classNames({
            [styles.fields]: true,
        });

        const actionsClassNames = classNames({
            [styles.actions]: true,
        });

        return (
            <div className={containerClassNames}>
                <div className={formClassNames}>
                    <form
                        action={action}
                        methd={method}
                        onSubmit={this.onFormSubmit}
                    >
                        <div className={fieldsClassNames}>
                            { this.renderFields() }
                        </div>
                        <div className={actionsClassNames}>
                            { this.renderActions() }
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

NormalForm.propTypes = propTypes;
NormalForm.defaultProps = defaultProps;

export default NormalForm;
