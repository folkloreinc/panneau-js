import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import classNames from 'classnames';
import { push } from 'react-router-redux';
import { defineMessages, FormattedMessage } from 'react-intl';

import * as PanneauPropTypes from '../../lib/PropTypes';
import withUrlGenerator from '../../lib/withUrlGenerator';
import withResourceApi from '../../lib/withResourceApi';
import withFormsCollection from '../../lib/withFormsCollection';
import Loading from '../partials/Loading';

import styles from '../../styles/pages/resource-form.scss';

const messages = defineMessages({
    cancel: {
        id: 'core.buttons.resources.cancel',
        description: 'The label of the "cancel" button',
        defaultMessage: 'Cancel',
    },
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
    successNotice: {
        id: 'core.notices.resources.success',
        description: 'The text of the "success" form notice',
        defaultMessage: 'Success!',
    },
    errorNotice: {
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
    }).isRequired,
    title: PanneauPropTypes.message,
    action: PropTypes.string,
    resource: PanneauPropTypes.resource.isRequired,
    resourceApi: PanneauPropTypes.resourceApi.isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    item: PropTypes.shape({
        id: PropTypes.number,
    }),
    successNoticeLabel: PanneauPropTypes.label,
    errorNoticeLabel: PanneauPropTypes.label,
    buttons: PanneauPropTypes.buttons,
    saveButtonLabel: PanneauPropTypes.message,
    errors: PropTypes.arrayOf(PropTypes.string),
    formValue: PropTypes.shape({}),
    formErrors: PropTypes.objectOf(PropTypes.array),
    readOnly: PropTypes.bool,
    gotoIndex: PropTypes.func.isRequired,
    onFormComplete: PropTypes.func,
};

const defaultProps = {
    action: 'create',
    title: messages.title,
    id: null,
    item: null,
    errors: null,
    formValue: null,
    formErrors: null,
    readOnly: false,
    successNoticeLabel: messages.successNotice,
    errorNoticeLabel: messages.errorNotice,
    buttons: [
        {
            id: 'cancel',
            type: 'button',
            label: messages.cancel,
            className: 'btn-link btn-lg',
        },
        {
            id: 'submit',
            type: 'submit',
            label: messages.save,
            className: 'btn-primary btn-lg',
        },
    ],
    saveButtonLabel: null,
    onFormComplete: null,
};

class ResourceForm extends Component {
    constructor(props) {
        super(props);

        this.onItemLoaded = this.onItemLoaded.bind(this);
        this.onItemLoadError = this.onItemLoadError.bind(this);
        this.onFormValueChange = this.onFormValueChange.bind(this);
        this.onFormComplete = this.onFormComplete.bind(this);
        this.onFormErrors = this.onFormErrors.bind(this);
        this.onClickCancel = this.onClickCancel.bind(this);
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
        const {
            id, action, resourceApi, match,
        } = this.props;
        if (action === 'edit' || action === 'show') {
            const itemId = get(match, 'params.id', id);
            resourceApi
                .show(itemId)
                .then(this.onItemLoaded)
                .catch(this.onItemLoadError);
        }
    }

    componentWillReceiveProps({ items: nextItems, errors: nextErrors }) {
        const { items, errors } = this.props;
        const itemChanged = nextItems !== items;
        if (itemChanged) {
            this.setState({
                item: nextItems,
            });
        }

        const errorsChanged = nextErrors !== errors;
        if (errorsChanged) {
            this.setState({
                errors: nextErrors,
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
        const { onFormComplete } = this.props;
        this.setState({
            item,
            formValue: null,
            formErrors: null,
            formNotice: 'success',
        });
        if (onFormComplete !== null) {
            onFormComplete(item);
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

    onClickCancel(e) {
        const { gotoIndex } = this.props;
        e.preventDefault();
        gotoIndex();
    }

    getType() {
        const { resource } = this.props;
        const { item } = this.state;
        const types = get(resource, 'types', []);
        const defaultType = types.find(it => get(it, 'default', false) === true) || get(types, '0', null);
        const locationType = this.getTypeFromLocation();
        const formType = get(item, 'type', get(locationType || defaultType || null, 'id', null));
        return formType;
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

        const { action, resource, resourceApi } = this.props;
        const { item, formValue } = this.state;

        const resourceType = get(resource, 'type', 'default');
        const data = resourceType === 'typed'
            ? {
                type: this.getType(),
                ...(formValue || item),
            }
            : formValue;

        return action === 'create'
            ? resourceApi.store(data)
            : resourceApi.update(item.id, data || item);
    }

    renderHeader() {
        const { action, resource, title } = this.props;

        const headerClassNames = classNames({
            'py-4': true,
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
        const defaultTitle = isObject(title) && typeof title.id !== 'undefined' ? (
            <FormattedMessage {...title} values={{ name }} />
        ) : (
            title
        );

        return (
            <div className={headerClassNames}>
                <h1
                    className={classNames({
                        'display-4': true,
                        'mb-0': true,
                    })}
                >
                    {message !== null ? message : defaultTitle}
                </h1>
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
                <strong>
                    The following error
                    {errors.length > 1 ? 's' : null}
                    {' '}
occured:
                </strong>
                <ul>{errors.map((error, index) => <li key={`error-${index}`}>{error}</li>)}</ul>
            </div>
        ) : null;
        /* eslint-enable react/no-array-index-key */
    }

    renderNotice() {
        const { successNoticeLabel, errorNoticeLabel } = this.props;
        const { formNotice } = this.state;
        let formNoticeText;
        let formNoticeType;
        let formNoticeIcon = null;
        if (formNotice === 'success') {
            formNoticeText = successNoticeLabel;
            formNoticeIcon = 'fas fa-check-circle';
            formNoticeType = 'success';
        } else if (formNotice === 'error') {
            formNoticeText = errorNoticeLabel;
            formNoticeIcon = 'fas fa-exclamation-circle';
            formNoticeType = 'danger';
        }
        const noticeCellTextClassNames = classNames({
            [`text-${formNoticeType}`]: formNoticeType,
        });
        const noticeCellIconClassNames = classNames({
            [styles.noticeIcon]: true,
            [formNoticeIcon]: formNoticeIcon !== null,
        });
        return (
            <span className={noticeCellTextClassNames}>
                <span className={noticeCellIconClassNames} aria-hidden="true" />
                {isObject(formNoticeText) && typeof formNoticeText.id !== 'undefined' ? (
                    <FormattedMessage {...formNoticeText} />
                ) : (
                    formNoticeText
                )}
            </span>
        );
    }

    renderForm() {
        const {
            action,
            resource,
            formsCollection,
            readOnly,
            buttons,
            saveButtonLabel,
        } = this.props;
        const {
            item, formValue, formErrors, formNotice,
        } = this.state;
        const resourceType = get(resource, 'type', 'default');
        const form = get(resource, `forms.${action}`, get(resource, 'forms', {}));
        const { type, ...formProps } = form;
        const FormComponent = formsCollection.getComponent(type || 'normal');
        const formButtons = readOnly
            ? []
            : buttons.map((button) => {
                if (button.id === 'save' && saveButtonLabel !== null) {
                    return {
                        ...button,
                        label: saveButtonLabel,
                    };
                }
                if (button.id === 'cancel' && typeof button.onClick === 'undefined') {
                    return {
                        ...button,
                        onClick: this.onClickCancel,
                    };
                }
                return button;
            });

        if (resourceType === 'typed') {
            const formType = this.getType();
            formProps.fields = get(
                formProps,
                `fields.${formType !== null ? formType : 'default'}`,
                get(formProps, 'fields.default', get(formProps, 'fields', [])),
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
                    notice={formNotice !== null ? this.renderNotice() : null}
                    submitForm={this.submitForm}
                    onValueChange={this.onFormValueChange}
                    onComplete={this.onFormComplete}
                    onErrors={this.onFormErrors}
                    {...formProps}
                />
            </div>
        ) : null;
    }

    // eslint-disable-next-line class-methods-use-this
    renderLoading() {
        return (
            <div
                className={classNames({
                    'py-4': true,
                    [styles.loading]: true,
                })}
            >
                <Loading loading />
            </div>
        );
    }

    render() {
        const { item } = this.state;
        const { action } = this.props;
        const isLoading = action !== 'create' && item === null;

        const containerClassNames = classNames({
            [styles.container]: true,
        });

        return (
            <div className={containerClassNames}>
                <div className="container">
                    <div className="row justify-content-md-center">
                        <div className="col-lg-8">
                            {this.renderHeader()}
                            {this.renderErrors()}
                            {isLoading ? this.renderLoading() : this.renderForm()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

const WithResourceApi = withResourceApi()(ResourceForm);
const mapStateToProps = ({ panneau }, {
    id = null, resource = null, action, match, location, urlGenerator,
}) => {
    const resources = get(panneau, 'definition.resources', []);
    const resourceId = get(match, 'params.resource', resource);
    const itemId = get(match, 'params.id', id);
    return {
        resource:
            resources.find(
                it => (resourceId !== null && it.id === resourceId)
                    || (resourceId === null
                        && urlGenerator.route(`resource.${it.id}.${action}`, {
                            id: itemId,
                        }) === location.pathname),
            ) || null,
    };
};
const mapDispatchToProps = (dispatch, { urlGenerator }) => ({
    gotoResourceIndex: resource => dispatch(
        push(
            typeof resource.routes !== 'undefined'
                ? urlGenerator.route(`resource.${resource.id}.index`)
                : urlGenerator.route('resource.index', {
                    resource: resource.id,
                }),
        ),
    ),
});
const mergeProps = (stateProps, { gotoResourceIndex }, ownProps) => ({
    ...ownProps,
    ...stateProps,
    gotoIndex: () => gotoResourceIndex(stateProps.resource),
});
const WithStateComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
)(WithResourceApi);
const WithFormsCollectionContainer = withFormsCollection()(WithStateComponent);
const WithUrlGeneratorContainer = withUrlGenerator()(WithFormsCollectionContainer);
const WithRouterContainer = withRouter(WithUrlGeneratorContainer);
export default WithRouterContainer;
