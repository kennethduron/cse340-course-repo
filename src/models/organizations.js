import db from './db.js';

const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id,
               name,
               description,
               contact_email,
               logo_filename
        FROM public.organization;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT organization_id,
               name,
               description,
               contact_email,
               logo_filename
        FROM public.organization
        WHERE organization_id = $1;
    `;

    const result = await db.query(query, [organizationId]);
    return result.rows[0] || null;
};

const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `INSERT INTO organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4) RETURNING organization_id;`;
    const result = await db.query(query, [name, description, contactEmail, logoFilename]);
    return result.rows[0].organization_id;
};

const updateOrganization = async (organizationId, name, description, contactEmail, logoFilename) => {
    const query = `UPDATE organization
        SET name = $1, description = $2, contact_email = $3, logo_filename = $4
        WHERE organization_id = $5 RETURNING organization_id;`;
    const result = await db.query(query, [name, description, contactEmail, logoFilename, organizationId]);
    if (result.rowCount === 0) {
        const error = new Error('Organization not found');
        error.status = 404;
        throw error;
    }
    return result.rows[0].organization_id;
};

export { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization };
