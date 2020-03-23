import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Link } from 'react-router-dom';
import isObject from 'lodash/isObject';
import classNames from 'classnames';
import {
    injectIntl, defineMessages, FormattedMessage, FormattedHTMLMessage,
} from 'react-intl';

import { withUrlGenerator } from '@folklore/react-container';
import * as PanneauPropTypes from '../../lib/PropTypes';
import { isMessage } from '../../utils';
import withResourceApi from '../../lib/withResourceApi';
import withFormsCollection from '../../lib/withFormsCollection';
import Errors from '../partials/Errors';
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
    static getDerivedStateFromProps({ errors: nextErrors }, { errors }) {
        const errorsChanged = nextErrors !== errors;
        if (errorsChanged) {
            return {
                errors: errorsChanged ? nextErrors : errors,
            };
        }

        return null;
    }

    constructor(props) {
        super(props);

        this.onItemLoaded = this.onItemLoaded.bind(this);
        this.onItemLoadError = this.onItemLoadError.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.onFormComplete = this.onFormComplete.bind(this);
        this.onFormErrors = this.onFormErrors.bind(this);
        this.onClickCancel = this.onClickCancel.bind(this);
        this.onClickSwitchType = this.onClickSwitchType.bind(this);
        this.submitForm = this.submitForm.bind(this);

        this.state = {
            item: props.item,
            errors: props.errors,
            formValue: props.formValue || props.item,
            formErrors: props.formErrors,
            formSuccess: props.formErrors !== null ? false : null,
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

    onFormChange(value) {
        this.setState({
            formValue: value,
            formSuccess: null,
        });
    }

    onFormComplete(item) {
        const { onFormComplete } = this.props;
        this.setState({
            item,
            formValue: null,
            formErrors: null,
            formSuccess: true,
        });
        if (onFormComplete !== null) {
            onFormComplete(item);
        }
    }

    onFormErrors(errors) {
        if (errors.name === 'ValidationError') {
            this.setState({
                formErrors: get(errors.responseData || {}, 'errors', errors.responseData),
                formSuccess: false,
            });
        } else if (errors.name === 'ResponseError') {
            this.setState({
                formErrors: get(errors.responseData || {}, 'error', null),
                formSuccess: false,
            });
        } else {
            this.setState({
                formSuccess: false,
            });
        }
    }

    onClickSwitchType(e) {
        const { intl, confirmSwitchTypeMessage } = this.props;
        const { formValue } = this.state;
        const currentType = this.getCurrentType();
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

    getTypes() {
        const { resource } = this.props;
        return resource.types || [];
    }

    getTypeFromLocation() {
        const { query } = this.props;
        const { type: typeId = null } = query;
        return typeId !== null ? this.getTypes().find(it => it.id === typeId) || null : null;
    }

    getTypeFromItem() {
        const { item } = this.state;
        const typeId = item !== null ? item.type || null : null;
        return typeId !== null ? this.getTypes().find(it => it.id === typeId) || null : null;
    }

    getDefaultType() {
        const types = this.getTypes();
        return types.length > 0
            ? types.find(({ default: isDefault = false }) => isDefault) || types[0] || null
            : null;
    }

    getCurrentType() {
        if (!this.isTyped()) {
            return null;
        }
        return this.getTypeFromItem() || this.getTypeFromLocation() || this.getDefaultType();
    }

    getForm() {
        const { resource, action } = this.props;
        const forms = resource.forms || {};
        const {
            type = 'normal', fields = [], fullscreen = false, ...form
        } = forms[action] || forms || {};
        const currentType = this.getCurrentType();
        return {
            type,
            fullscreen,
            fields:
                currentType !== null && isObject(fields)
                    ? fields[currentType.id] || fields.default || fields
                    : fields,
            ...form,
        };
    }

    getButtons() {
        const { buttons, readOnly, saveButtonLabel } = this.props;
        return readOnly
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
    }

    getNotice() {
        const { successNoticeLabel, errorNoticeLabel } = this.props;
        const { formSuccess } = this.state;
        if (formSuccess === null) {
            return null;
        }
        return formSuccess
            ? {
                type: 'success',
                label: successNoticeLabel,
            }
            : {
                type: 'error',
                label: errorNoticeLabel,
            };
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
        const { action, resourceApi } = this.props;
        const { item, formValue } = this.state;

        const currentType = this.getCurrentType();
        const data = this.isTyped()
            ? {
                type: currentType !== null ? currentType.id : null,
                ...(formValue || item),
            }
            : formValue;

        this.setState({
            formSuccess: null,
        });

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
        const { fullscreen } = this.getForm();

        return (
            <div
                className={classNames([
                    styles.header,
                    {
                        'py-4': !fullscreen,
                        'px-2': fullscreen,
                        'py-3': fullscreen,
                    },
                ])}
            >
                {currentType !== null && action === 'create' ? (
                    <div className={classNames(['row', 'no-gutters', 'align-items-center'])}>
                        <div className="col">{this.renderTitle()}</div>
                        <div className={classNames(['col', 'col-md-auto', 'text-right'])}>
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
        return errors !== null && errors.length > 0 ? (
            <Errors errors={errors} className={styles.errors} />
        ) : null;
    }

    renderForm() {
        const { formsCollection, readOnly } = this.props;
        const { item, formValue, formErrors } = this.state;
        const { type, className = null, ...formProps } = this.getForm();
        const FormComponent = formsCollection.getComponent(type);
        const buttons = this.getButtons();
        const notice = this.getNotice();

        return FormComponent !== null ? (
            <FormComponent
                {...formProps}
                className={classNames([
                    styles.form,
                    {
                        [className]: className !== null,
                    },
                ])}
                readOnly={readOnly}
                buttons={buttons}
                value={formValue || item}
                errors={formErrors}
                notice={notice}
                submitForm={this.submitForm}
                onChange={this.onFormChange}
                onComplete={this.onFormComplete}
                onErrors={this.onFormErrors}
            />
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
        const { fullscreen } = this.getForm();

        return (
            <div
                className={classNames([
                    styles.container,
                    {
                        [styles.isFullscreen]: fullscreen,
                    },
                ])}
            >
                {fullscreen ? (
                    <div className={classNames([styles.inner])}>
                        {this.renderHeader()}
                        <div className={classNames([styles.content])}>
                            {this.renderErrors()}
                            {isLoading ? this.renderLoading() : this.renderForm()}
                        </div>
                    </div>
                ) : (
                    <div className="container">
                        <div className="row justify-content-md-center">
                            <div className="col-lg-9">
                                {this.renderHeader()}
                                {this.renderErrors()}
                                {isLoading ? this.renderLoading() : this.renderForm()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

const WithResourceApi = withResourceApi()(ResourceForm);
const WithFormsCollectionContainer = withFormsCollection()(WithResourceApi);
const WithUrlGeneratorContainer = withUrlGenerator(WithFormsCollectionContainer);
const WithIntlContainer = injectIntl(WithUrlGeneratorContainer);
export default WithIntlContainer;
