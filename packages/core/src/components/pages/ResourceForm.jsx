import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Link } from 'react-router-dom';
import isArray from 'lodash/isArray';
import classNames from 'classnames';
import {
    injectIntl, defineMessages, FormattedMessage, FormattedHTMLMessage,
} from 'react-intl';

import * as PanneauPropTypes from '../../lib/PropTypes';
import { isMessage } from '../../utils';
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
    titleTyped: {
        id: 'core.titles.resources.typed',
        description: 'The title of the typed resource form',
        defaultMessage: '{name} <small class="text-muted">({type})</small>',
    },
    switchType: {
        id: 'core.buttons.resources.switch_type',
        description: 'The label of the select type button',
        defaultMessage: 'Switch type',
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
    confirmSwitchType: {
        id: 'core.resources.form.confirm_switch_type',
        description: 'The confirm message when switching type',
        defaultMessage: 'Are you sure you want to switch type?',
    },
});

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    urlGenerator: PanneauPropTypes.urlGenerator.isRequired,
    formsCollection: PanneauPropTypes.componentsCollection.isRequired,
    title: PanneauPropTypes.label,
    titleTyped: PanneauPropTypes.label,
    action: PropTypes.string,
    resource: PanneauPropTypes.resource.isRequired,
    resourceApi: PanneauPropTypes.resourceApi.isRequired,
    itemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    item: PropTypes.shape({
        id: PropTypes.number,
    }),
    query: PropTypes.shape({
        type: PropTypes.string,
    }),
    successNoticeLabel: PanneauPropTypes.label,
    errorNoticeLabel: PanneauPropTypes.label,
    buttons: PanneauPropTypes.buttons,
    saveButtonLabel: PanneauPropTypes.message,
    confirmSwitchTypeMessage: PanneauPropTypes.message,
    errors: PropTypes.arrayOf(PropTypes.string),
    formValue: PropTypes.shape({}),
    formErrors: PropTypes.objectOf(PropTypes.array),
    readOnly: PropTypes.bool,
    gotoResourceAction: PropTypes.func.isRequired,
    onFormComplete: PropTypes.func,
};

const defaultProps = {
    action: 'create',
    title: messages.title,
    titleTyped: messages.titleTyped,
    query: null,
    itemId: null,
    item: null,
    errors: null,
    formValue: null,
    formErrors: null,
    readOnly: false,
    successNoticeLabel: messages.successNotice,
    errorNoticeLabel: messages.errorNotice,
    confirmSwitchTypeMessage: messages.confirmSwitchType,
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
    static getDerivedStateFromProps({ errors: nextErrors }, state) {
        console.log(state);
        const { errors } = state;
        const errorsChanged = nextErrors !== errors;
        if (errorsChanged) {
            return {
                errors: errorsChanged ? nextErrors : errors,
            };
        }

        return null;
    }

    constructor(props) {
        console.log('AAA');

        super(props);

        this.onItemLoaded = this.onItemLoaded.bind(this);
        this.onItemLoadError = this.onItemLoadError.bind(this);
        this.onFormValueChange = this.onFormValueChange.bind(this);
        this.onFormComplete = this.onFormComplete.bind(this);
        this.onFormErrors = this.onFormErrors.bind(this);
        this.onClickCancel = this.onClickCancel.bind(this);
        this.onClickSwitchType = this.onClickSwitchType.bind(this);
        this.submitForm = this.submitForm.bind(this);

        this.state = {
            item: props.item,
            errors: props.errors,
            formGeneralError: null,
            formValue: props.formValue || props.item,
            formErrors: props.formErrors,
            formNotice: props.formErrors !== null ? 'error' : null,
        };
    }

    componentDidMount() {
        const { action } = this.props;
        const { item } = this.state;
        if ((action === 'edit' || action === 'show') && item === null) {
            this.loadItem();
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
            formGeneralError: null,
            formNotice: 'success',
        });
        if (onFormComplete !== null) {
            onFormComplete(item);
        }
    }

    onFormErrors(errors) {
        if (errors.name === 'ValidationError') {
            this.setState({
                formErrors: get(errors.responseData || {}, 'errors', errors.responseData),
                formNotice: 'error',
            });
        } else if (errors.name === 'ResponseError') {
            this.setState({
                formGeneralError: get(errors.responseData || {}, 'error', null),
                formNotice: 'error',
            });
        } else {
            this.setState({
                formNotice: 'error',
            });
        }
    }

    onClickSwitchType(e) {
        const { intl, resource, confirmSwitchTypeMessage } = this.props;
        const { formValue } = this.state;
        const types = get(resource, 'types', []);
        const currentTypeId = this.getType();
        const currentType = types.find(({ id }) => id === currentTypeId) || null;
        const confirmMessage = isMessage(confirmSwitchTypeMessage)
            ? intl.formatMessage(confirmSwitchTypeMessage, {
                type: currentType.label,
            })
            : confirmSwitchTypeMessage;
        // eslint-disable-next-line no-alert
        if (formValue !== null && !window.confirm(confirmMessage)) {
            e.preventDefault();
        }
    }

    onClickCancel(e) {
        const { gotoResourceAction } = this.props;
        e.preventDefault();
        gotoResourceAction('index');
    }

    getTypeFromLocation() {
        const { query, resource } = this.props;
        const { type = null } = query;
        const types = get(resource, 'types', []);
        return type !== null ? types.find(it => it.id === type) || null : null;
    }

    getType() {
        const { resource } = this.props;
        const { item } = this.state;
        const { types = [] } = resource;
        // prettier-ignore
        const defaultType = types.find(({ default: isDefault = false }) => (
            isDefault
        )) || types[0] || null;
        const locationType = this.getTypeFromLocation();
        return (item || {}).type || (locationType || defaultType || {}).id || null;
    }

    getCurrentType() {
        if (!this.isTyped()) {
            return null;
        }
        const { resource } = this.props;
        const { types = [] } = resource;
        const currentTypeId = this.getType();
        return types.find(({ id }) => id === currentTypeId) || null;
    }

    isTyped() {
        const { resource } = this.props;
        return (resource.type || null) === 'typed';
    }

    loadItem() {
        const { itemId, resourceApi } = this.props;
        resourceApi
            .show(itemId)
            .then(this.onItemLoaded)
            .catch(this.onItemLoadError);
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

    renderTitle() {
        const {
            action, resource, title, titleTyped,
        } = this.props;

        const currentType = this.getCurrentType();

        const name = get(
            resource,
            'messages.names.a',
            get(resource, 'messages.name', resource.name),
        );
        const customTitle = currentType !== null
            ? get(
                resource,
                `messages.titles.resources.${action}_${currentType.id}`,
                get(
                    resource,
                    `messages.titles.resources.${action}_typed`,
                    get(
                        resource,
                        `messages.titles.resources.${action}`,
                        get(resource, 'messages.titles.resources.default', null),
                    ),
                ),
            )
            : get(
                resource,
                `messages.titles.resources.${action}`,
                get(resource, 'messages.titles.resources.default', null),
            );
        const defaultTitle = currentType !== null ? titleTyped : title;
        const finalTitle = customTitle || defaultTitle;
        return (
            <h1 className={classNames(['mb-0', 'mt-0', styles.title])}>
                {isMessage(finalTitle) ? (
                    <FormattedHTMLMessage
                        {...finalTitle}
                        tagName="span"
                        values={{ name, type: currentType !== null ? currentType.label : null }}
                    />
                ) : (
                    finalTitle
                )}
            </h1>
        );
    }

    renderHeader() {
        const { action, resource, urlGenerator } = this.props;

        const { types = [] } = resource;
        const currentType = this.getCurrentType();

        return (
            <div className={classNames(['py-4', styles.header])}>
                {this.isTyped() && action === 'create' ? (
                    <div className={styles.cols}>
                        <div className={styles.col}>{this.renderTitle()}</div>
                        <div className={classNames([styles.col, 'text-right'])}>
                            <div className={classNames(['btn-group', 'btn-group-sm'])}>
                                <button
                                    type="button"
                                    className={classNames([
                                        'btn',
                                        'btn-primary',
                                        'dropdown-toggle',
                                    ])}
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    <FormattedMessage {...messages.switchType} />
                                    {' '}
                                    <span className="caret" />
                                </button>
                                <div className="dropdown-menu">
                                    {types.map(({ id, label }) => (
                                        <Link
                                            key={`add-button-${id}`}
                                            to={`${urlGenerator.route('resource.create', {
                                                resource: resource.id,
                                            })}?type=${id}`}
                                            className={classNames([
                                                'dropdown-item',
                                                {
                                                    active: id === currentType.id,
                                                },
                                            ])}
                                            onClick={this.onClickSwitchType}
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    this.renderTitle()
                )}
            </div>
        );
    }

    renderErrors() {
        const { errors } = this.state;
        /* eslint-disable react/no-array-index-key */
        return isArray(errors) && errors.length > 0 ? (
            <div className={classNames(['alert', 'alert-danger', styles.errors])}>
                <ul>
                    {errors.map((error, index) => (
                        <li key={`error-${index}`}>{error}</li>
                    ))}
                </ul>
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

        return (
            <span
                className={classNames({
                    [`text-${formNoticeType}`]: formNoticeType,
                })}
            >
                <span
                    className={classNames([
                        styles.noticeIcon,
                        {
                            [formNoticeIcon]: formNoticeIcon !== null,
                        },
                    ])}
                    aria-hidden="true"
                />
                {isMessage(formNoticeText) ? (
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
            item, formValue, formGeneralError, formErrors, formNotice,
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
                `fields.${formType || 'default'}`,
                get(formProps, 'fields.default', get(formProps, 'fields', [])),
            );
        }

        return FormComponent !== null ? (
            <div className={styles.form}>
                <FormComponent
                    readOnly={readOnly}
                    buttons={formButtons}
                    value={formValue || item}
                    generalError={formGeneralError}
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
            <div className={classNames(['py-4', styles.loading])}>
                <Loading loading />
            </div>
        );
    }

    render() {
        const { item } = this.state;
        const { action } = this.props;
        const isLoading = action !== 'create' && item === null;

        return (
            <div className={styles.container}>
                <div className="container">
                    <div className="row justify-content-md-center">
                        <div className="col-lg-9">
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
const WithFormsCollectionContainer = withFormsCollection()(WithResourceApi);
const WithUrlGeneratorContainer = withUrlGenerator()(WithFormsCollectionContainer);
const WithIntlContainer = injectIntl(WithUrlGeneratorContainer);
export default WithIntlContainer;
