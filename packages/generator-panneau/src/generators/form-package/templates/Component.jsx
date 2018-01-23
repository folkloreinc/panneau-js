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
    buttons: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        className: PropTypes.string,
        onClick: PropTypes.func,
    })),
    submitForm: PropTypes.shape({
        then: PropTypes.func.isRequired,
    }),
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
    submitForm: null,
    onValueChange: null,
    onSubmit: null,
    onErrors: null,
    onComplete: null,
};

class <%= componentName %> extends Component {
    constructor(props) {
        super(props);

        this.onFieldsValueChange = this.onFieldsValueChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);

        this.state = {
            value: props.value,
            errors: props.errors,
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
                .then(this.onFormSubmitError);
        }
    }

    onFormSubmitComplete(data) {
        const { onComplete } = this.props;
        if (onComplete !== null) {
            onComplete(data);
        }
    }

    onFormSubmitError(errors) {
        const { onErrors } = this.props;
        if (onErrors !== null) {
            onErrors(errors);
        } else {
            this.setState({
                errors,
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

<%= componentName %>.propTypes = propTypes;
<%= componentName %>.defaultProps = defaultProps;

export default <%= componentName %>;
