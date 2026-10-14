import TextField from '../../../../fields/text/src/TextField';
import FormGroup from '../FormGroup';

export default {
    component: FormGroup,
    title: 'Elements/FormGroup',
    parameters: {
        intl: true,
    },
};

function Field() {
    return (
        <FormGroup label="Field form group label">
            <TextField placeholder="My text field" />
        </FormGroup>
    );
}

export const Normal = {
    render: function () {
        return (
            <FormGroup label="Form group label">
                <Field />
            </FormGroup>
        );
    },
};

export const IsCard = {
    render: function () {
        return (
            <FormGroup label="Form group label" isCard>
                <Field />
            </FormGroup>
        );
    },
};

export const IsHeading = {
    render: function () {
        return (
            <>
                <FormGroup label="Form group label">
                    <Field />
                </FormGroup>
                <FormGroup label="Form group label" isHeading>
                    <Field />
                </FormGroup>
            </>
        );
    },
};

export const IsCollapsible = {
    render: function () {
        return (
            <FormGroup label="Form group label" isCollapsible>
                <Field />
            </FormGroup>
        );
    },
};

export const IsCollapsibleCard = {
    render: () => (
        <FormGroup label="Form group label" isCollapsible isCard>
            <Field />
        </FormGroup>
    ),
};

export const Horizontal = {
    render: () => (
        <FormGroup label="Form group label" horizontal>
            <Field />
            <Field />
            <Field />
        </FormGroup>
    ),
};

export const Inline = {
    render: () => (
        <FormGroup
            label="Form group label"
            inline
            errors={['This is bad', "Don't do this"]}
            helpText="Help me!"
        >
            <Field />
            <Field />
            <Field />
        </FormGroup>
    ),
};

export const Stacked = {
    render: () => (
        <>
            <FormGroup label="Form group label" isCollapsible isCard className="mb-3">
                <Field />
            </FormGroup>
            <FormGroup label="Form group label" isCard className="mb-3">
                <Field />
            </FormGroup>
            <FormGroup label="Form group label" isCollapsible isCard>
                <Field />
            </FormGroup>
        </>
    ),
};

export const WithHelpText = {
    render: () => (
        <FormGroup label="Form group label" helpText="Help me!">
            <Field />
        </FormGroup>
    ),
};

export const WithErrors = {
    render: () => (
        <FormGroup
            label="Form group label"
            helpText="Help me!"
            errors={['This is bad', "Don't do this"]}
        >
            <Field />
        </FormGroup>
    ),
};
