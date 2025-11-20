import ResourceForm from '@panneau/form-resource';

// Kept for backward compatibility with exports
function ResourceFormWrapper(props: any) {
    return <ResourceForm {...props} />;
}

export default ResourceFormWrapper;
