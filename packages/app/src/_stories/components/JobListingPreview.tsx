interface JobListingValue {
    title?: Record<string, string> | null;
    description?: Record<string, string> | null;
    details?: {
        location?: string | null;
        remote?: boolean;
    } | null;
}

/**
 * Example of a preview shown next to the form of the "two-pane" form component.
 * It is registered in the "previews" namespace with the id of the resource.
 */
function JobListingPreview({ value = null }: { value?: JobListingValue | null }) {
    const { title = null, details = null, description = null } = value || {};
    const { location = null, remote = false } = details || {};
    const text = (description?.fr || '').replace(/<[^>]+>/g, ' ').trim();
    return (
        <div className="card sticky-top" style={{ top: 80 }}>
            <div className="card-header text-body-secondary">Aperçu sur le site</div>
            <div className="card-body">
                <h2 className="h4">{title?.fr || 'Titre du poste'}</h2>
                <p className="text-body-secondary">
                    {location || 'Lieu à préciser'}
                    {remote ? ' · Télétravail possible' : null}
                </p>
                <p className="mb-0">{text}</p>
            </div>
        </div>
    );
}

export default JobListingPreview;
