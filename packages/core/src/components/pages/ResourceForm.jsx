import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isString from 'lodash/isString';
import classNames from 'classnames';
import { defineMessages, FormattedMessage } from 'react-intl';

import PanneauPropTypes from '../../lib/PropTypes';
import withFormsCollection from '../../lib/withFormsCollection';

import styles from '../../styles/pages/resource-form.scss';

const messages = defineMessages({
    save: {
        id: 'core.buttons.resources.save',
        description: 'The label of the "save" button',
        defaultMessage: 'Save',
    },
    title: {
        id: 'core.titles.resources.default',
        description: 'The title of the resource form',
        defaultMessage: '{name}',
    },
    success: {
        id: 'core.notices.resources.success',
        description: 'The text of the "success" form notice',
        defaultMessage: 'Success!',
    },
    error: {
        id: 'core.notices.resources.error',
        description: 'The text of the "error" form notice',
        defaultMessage: 'Failed. The form contains errors.',
    },
});

const propTypes = {
    formsCollection: PanneauPropTypes.componentsCollection.isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string,
        }),
    }).isRequired,
    location: PropTypes.shape({
        search: PropTypes.string,
        state: PropTypes.object,
    }),
    title: PanneauPropTypes.message,
    action: PropTypes.string,
    resource: PanneauPropTypes.resource.isRequired,
    item: PropTypes.shape({
        id: PropTypes.number,
    }),
    buttons: PanneauPropTypes.buttons,
    errors: PropTypes.arrayOf(PropTypes.string),
    formValue: PropTypes.shape({}),
    formErrors: PropTypes.objectOf(PropTypes.array),
    readOnly: PropTypes.bool,
    onFormComplete: PropTypes.func,
};

const defaultProps = {
    action: 'create',
    title: messages.title,
    item: null,
    errors: null,
    formValue: null,
    formErrors: null,
    readOnly: false,
    onFormComplete: null,
    buttons: [
        {
            id: 'submit',
            type: 'submit',
            label: messages.save,
            className: 'btn-primary',
        },
    ],
};

class ResourceForm extends Component {
    constructor(props) {
        super(props);

        this.onItemLoaded = this.onItemLoaded.bind(this);
        this.onItemLoadError = this.onItemLoadError.bind(this);
        this.onFormValueChange = this.onFormValueChange.bind(this);
        this.onFormComplete = this.onFormComplete.bind(this);
        this.onFormErrors = this.onFormErrors.bind(this);
        this.submitForm = this.submitForm.bind(this);

        this.state = {
            item: props.item,
            errors: props.errors,
            formValue: props.formValue || props.item,
            formErrors: props.formErrors,
            formNotice: props.formErrors !== null ? 'error' : null,
        };
    }

    componentDidMount() {
        const { action, resource, match } = this.props;
        if (action === 'edit' || action === 'show') {
            const id = get(match, 'params.id');
            resource.api
                .show(id)
                .then(this.onItemLoaded)
                .catch(this.onItemLoadError);
        }
    }

    componentWillReceiveProps(nextProps) {
        const itemChanged = nextProps.item !== this.props.item;
        if (itemChanged) {
            this.setState({
                item: nextProps.item,
            });
        }

        const errorsChanged = nextProps.errors !== this.props.errors;
        if (errorsChanged) {
            this.setState({
                errors: nextProps.errors,
            });
        }
    }

    onItemLoaded(item) {
        this.setState({
            item,
        });
    }

    onItemLoadError(errors) {
        this.setState({
            errors,
        });
    }

    onFormValueChange(value) {
        this.setState({
            formValue: value,
            formNotice: null,
        });
    }

    onFormComplete(item) {
        this.setState({
            item,
            formValue: null,
            formErrors: null,
            formNotice: 'success',
        });
        if (this.props.onFormComplete) {
            this.props.onFormComplete(item);
        }
    }

    onFormErrors(errors) {
        if (errors.name === 'ValidationError') {
            this.setState({
                formErrors: errors.responseData,
                formNotice: 'error',
            });
        } else if (errors.name === 'ResponseError') {
            this.setState({
                errors: [errors.responseData.error],
            });
        } else {
            this.setState({
                errors,
            });
        }
    }

    getTypeFromLocation() {
        const { location, resource } = this.props;
        const types = get(resource, 'types', []);
        const searchMatches = (location.search || '').match(/type=([^&]+)/);
        const locationTypeId = get(location, 'state.type', get(searchMatches, '1', null));
        const locationType = types.find(it => it.id === locationTypeId) || null;
        return locationType;
    }

    submitForm() {
        this.setState({
            formNotice: null,
        });

        const { action, resource } = this.props;
        const { item, formValue } = this.state;
        return action === 'create'
            ? resource.api.store(formValue)
            : resource.api.update(item.id, formValue || item);
    }

    renderHeader() {
        const { action, resource, title } = this.props;

        const headerClassNames = classNames({
            [styles.header]: true,
        });

        const message = get(
            resource,
            `messages.titles.resources.${action}`,
            get(resource, 'messages.titles.resources.default', null),
        );
        const name = get(
            resource,
            'messages.names.a',
            get(resource, 'messages.name', resource.name),
        );
        const defaultTitle = isString(title) ? (
            title
        ) : (
            <FormattedMessage {...title} values={{ name }} />
        );

        return (
            <div className={headerClassNames}>
                <h1>{message !== null ? message : defaultTitle}</h1>
            </div>
        );
    }

    renderErrors() {
        const { errors } = this.state;

        const errorsClassNames = classNames({
            [styles.errors]: true,
            alert: true,
            'alert-danger': true,
        });

        /* eslint-disable react/no-array-index-key */
        return errors !== null && errors.length > 0 ? (
            <div className={errorsClassNames}>
                <strong>The following error{errors.length > 1 ? 's' : null} occured:</strong>
                <ul>{errors.map((error, index) => <li key={`error-${index}`}>{error}</li>)}</ul>
            </div>
        ) : null;
        /* eslint-enable react/no-array-index-key */
    }

    renderForm() {
        const {
            action, resource, formsCollection, readOnly, buttons,
        } = this.props;
        const {
            item, formValue, formErrors, formNotice,
        } = this.state;
        const resourceType = get(resource, 'type', 'default');
        const form = get(resource, `forms.${action}`, get(resource, 'forms', {}));
        const { type, ...formProps } = form;
        const FormComponent = formsCollection.getComponent(type || 'normal');
        const formButtons = readOnly ? [] : buttons;

        if (resourceType === 'typed') {
            const types = get(resource, 'types', []);
            const defaultType =
                types.find(it => get(it, 'default', false) === true) || get(types, '0', null);
            const locationType = this.getTypeFromLocation();
            const formType = get(item, 'type', locationType || defaultType);
            formProps.fields = get(
                formProps,
                `fields.${formType !== null ? formType.id : 'default'}`,
                get(formProps, 'fields.default', get(formProps, 'fields', [])),
            );
        }

        let noticeNode = null;
        if (formNotice !== null) {
            let formNoticeText;
            let formNoticeType;
            let formNoticeIcon;
            if (formNotice === 'success') {
                formNoticeText = messages.success;
                formNoticeIcon = 'ok';
                formNoticeType = 'success';
            } else if (formNotice === 'error') {
                formNoticeText = messages.error;
                formNoticeIcon = 'remove';
                formNoticeType = 'danger';
            }
            const noticeCellTextClassNames = classNames({
                [`text-${formNoticeType}`]: formNoticeType,
            });
            const noticeCellIconClassNames = classNames({
                [styles.noticeIcon]: true,
                glyphicon: true,
                [`glyphicon-${formNoticeIcon}`]: formNoticeIcon,
            });
            noticeNode = (
                <span className={noticeCellTextClassNames}>
                    <span
                        className={noticeCellIconClassNames}
                        aria-hidden="true"
                    />
                    {isString(formNoticeText) ? formNoticeText : (
                        <FormattedMessage {...formNoticeText} />
                    )}
                </span>
            );
        }
        const formClassNames = classNames({
            [styles.form]: true,
        });

        return FormComponent !== null ? (
            <div className={formClassNames}>
                <FormComponent
                    readOnly={readOnly}
                    buttons={formButtons}
                    value={formValue || item}
                    errors={formErrors}
                    notice={noticeNode}
                    submitForm={this.submitForm}
                    onValueChange={this.onFormValueChange}
                    onComplete={this.onFormComplete}
                    onErrors={this.onFormErrors}
                    {...formProps}
                />
            </div>
        ) : null;
    }

    render() {
        const { item } = this.state;
        const { action } = this.props;
        const needsForm = item !== null || action === 'create';

        const containerClassNames = classNames({
            [styles.container]: true,
        });

        return (
            <div className={containerClassNames}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 col-md-offset-2">
                            {this.renderHeader()}
                            {this.renderErrors()}
                            {needsForm && this.renderForm()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

const mapStateToProps = ({ panneau }, { action, match, location }) => {
    const resources = get(panneau, 'definition.resources', []);
    const resourceId = get(match, 'params.resource', null);
    const resource = resources.find(it =>
        (resourceId !== null && it.id === resourceId) ||
            (resourceId === null &&
                get(it, `routes.${action}`, null) === location.pathname)) || null;
    return {
        resource,
    };
};

const WithStateComponent = connect(mapStateToProps)(ResourceForm);
const WithRouterContainer = withRouter(WithStateComponent);
const WithFormsCollectionContainer = withFormsCollection()(WithRouterContainer);
export default WithFormsCollectionContainer;
