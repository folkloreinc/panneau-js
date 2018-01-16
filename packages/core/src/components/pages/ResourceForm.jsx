import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import get from 'lodash/get';
import classNames from 'classnames';

import withComponentsCollection from '../../lib/withComponentsCollection';

import styles from '../../styles/pages/resource-index.scss';

const propTypes = {
    formsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }).isRequired,
    params: PropTypes.shape({
        id: PropTypes.number,
    }).isRequired,
    action: PropTypes.string,
    resource: PropTypes.shape({

    }).isRequired,
    item: PropTypes.shape({
        id: PropTypes.number,
    }),
    errors: PropTypes.arrayOf(PropTypes.string),
    formData: PropTypes.shape({}),
    formErrors: PropTypes.objectOf(PropTypes.array),
};

const defaultProps = {
    action: 'create',
    item: null,
    errors: null,
    formData: null,
    formErrors: null,
};

class ResourceForm extends Component {
    constructor(props) {
        super(props);

        this.onItemLoaded = this.onItemLoaded.bind(this);
        this.onItemLoadError = this.onItemLoadError.bind(this);
        this.onItemSaved = this.onItemSaved.bind(this);
        this.onItemSaveError = this.onItemSaveError.bind(this);

        this.state = {
            item: props.item,
            errors: props.errors,
            formData: props.formData || props.item,
            formErrors: props.formErrors,
        };
    }

    componentDidMount() {
        const { action, resource, params } = this.props;
        if (action === 'edit') {
            resource.api.show(params.id)
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

    onItemSaved(item) {
        this.setState({
            item,
            formData: null,
        });
    }

    onItemSaveError(errors) {
        this.setState({
            formErrors: errors,
        });
    }

    submitForm() {
        const { action, resource } = this.props;
        const { item, formData } = this.state;
        (action === 'create' ?
            resource.api.store(formData) : resource.api.update(item.id, formData))
            .then(this.onItemSaved)
            .catch(this.onItemSaveError);
    }

    renderHeader() {
        const { resource } = this.props;

        const headerClassNames = classNames({
            [styles.header]: true,
        });

        return (
            <div className={headerClassNames}>
                <h1>{ resource.name }</h1>
            </div>
        );
    }

    renderErrors() {
        const { errors } = this.state;

        const errorsClassNames = classNames({
            [styles.errors]: true,
        });

        /* eslint-disable react/no-array-index-key */
        return errors !== null && errors.length > 1 ? (
            <div className={errorsClassNames}>
                <ul>
                    { errors.map((error, index) => (
                        <li key={`error-${index}`}>{ error }</li>
                    )) }
                </ul>
            </div>
        ) : null;
        /* eslint-enable react/no-array-index-key */
    }

    renderForm() {
        const { resource, formsCollection } = this.props;
        const { formData, formErrors } = this.state;
        const form = get(resource, 'forms.index', get(resource, 'forms', {}));
        const { type, ...formProps } = form;
        const FormComponent = formsCollection.getComponent(type || 'normal');

        const formClassNames = classNames({
            [styles.form]: true,
        });

        return FormComponent !== null ? (
            <div className={formClassNames}>
                <FormComponent
                    value={formData}
                    errors={formErrors}
                    submitForm={this.submitForm}
                    {...formProps}
                />
            </div>
        ) : null;
    }

    render() {
        const containerClassNames = classNames({
            [styles.container]: true,
        });

        return (
            <div className={containerClassNames}>
                { this.renderHeader() }
                { this.renderErrors() }
                { this.renderForm() }
            </div>
        );
    }
}

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

const mapStateToProps = ({ panneau }, { action, params, location }) => {
    const resources = get(panneau, 'definition.resources', []);
    const resourceId = get(params, 'resource', null);
    return {
        resource: resources.find(it => (
            (resourceId !== null && it.id === resourceId) ||
            (resourceId === null && get(it, `routes.${action}`, null) === location.pathname)
        )) || null,
    };
};

const mapCollectionToProps = collection => ({
    componentsCollection: collection,
    formsCollection: collection.getCollection('forms'),
});

const WithStateComponent = connect(mapStateToProps)(ResourceForm);
const WithRouterContainer = withRouter(WithStateComponent);
const WithComponentsCollectionContainer = withComponentsCollection((
    mapCollectionToProps
))(WithRouterContainer);
export default WithComponentsCollectionContainer;
